import { memo, useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { SlotItem } from '../../slot-item';
import { EmptyDayCard } from '../../EmptyDayCard';
import { RemainingTimeCard } from '../../RemainingTimeCard';
import { ControllableScrollView } from './ControllableScrollView';
import { Text, colors, SlotItem as SlotItemType, fontSize } from '@project/shared';
import { useTranslation } from '@project/i18n';
import dayjs from 'dayjs';
import { getDateFromIndex } from '../shared/utils';
import { useSlotData } from '../shared/hooks';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';

interface DayPageProps {
  dayIndex: number;
  screenWidth: number;
  loading: boolean;
  slotListPanRef: any;
  updateSlotCache: (
    slotId: string,
    sourceDate: string,
    targetDate: string,
    updatedSlot: SlotItemType | null
  ) => void;
  selectedDate: string;
  draggedSlot: SlotItemType | null;
  cachedSlotsForDate?: SlotItemType[] | undefined;
}

const DayPageComponent = ({
  dayIndex,
  screenWidth,
  loading,
  slotListPanRef,
  updateSlotCache,
  selectedDate,
  draggedSlot,
  cachedSlotsForDate,
}: DayPageProps) => {
  const t = useTranslation();
  const date = getDateFromIndex(dayIndex);
  const [showSpaceForDraggedSlot, setShowSpaceForDraggedSlot] = useState(false);
  const isCurrentDay = date === selectedDate;
  const { createEnhancedSlotData } = useSlotData();
  const [, setRebuild] = useState(0);
  const { sourceDayDate } = useDraggedSlotContext();
  const [shouldShowEmpty, setShouldShowEmpty] = useState(true);

  const applyDate = (isoString: string, targetDate: string) => {
    try {
      const source = dayjs(isoString);
      const target = dayjs(targetDate, 'YYYY-MM-DD');
      const adjusted = source
        .year(target.year())
        .month(target.month())
        .date(target.date());
      return adjusted.toISOString();
    } catch {
      return isoString;
    }
  };

  // Use the passed cached slots directly (single source of truth)
  const daySlots =
    cachedSlotsForDate && cachedSlotsForDate.length > 0
      ? cachedSlotsForDate
      : null;

  useEffect(() => {
    if (!daySlots || daySlots.length > 0) {
      setShouldShowEmpty(true);
      return;
    }

    setShouldShowEmpty(false);
    const timer = setTimeout(() => {
      setShouldShowEmpty(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [daySlots]);

  // Set up timers to rebuild when slot start/end times are reached
  useEffect(() => {
    if (!isCurrentDay || !daySlots?.length) {
      return;
    }

    const now = dayjs();
    const timeouts: NodeJS.Timeout[] = [];

    // Collect all start and end times from slots
    const startTimes = daySlots
      .map(slot => slot.startTime)
      .filter(
        (startTime): startTime is string =>
          startTime !== null && startTime !== undefined
      )
      .map(startTime => dayjs(startTime));

    const endTimes = daySlots
      .map(slot => slot.endTime)
      .filter(
        (endTime): endTime is string =>
          endTime !== null && endTime !== undefined
      )
      .map(endTime => dayjs(endTime));

    const allBoundaryTimes = [...startTimes, ...endTimes];

    // Set up a timeout for each future boundary time
    allBoundaryTimes.forEach(boundaryTime => {
      const msUntilBoundary = boundaryTime.diff(now);

      if (msUntilBoundary > 0) {
        const timeout = setTimeout(() => {
          setRebuild(prev => prev + 1);
        }, msUntilBoundary);

        timeouts.push(timeout);
      }
    });

    // Clean up all timeouts
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [daySlots, isCurrentDay]);

  // handle cache and dynamic DayPage layout during drag and drop
  useEffect(() => {
    if (!draggedSlot) {
      setShowSpaceForDraggedSlot(false);
      return;
    }
    if (!isCurrentDay) {
      setShowSpaceForDraggedSlot(false);
      return;
    }

    if (showSpaceForDraggedSlot) {
      return;
    }
    if (!sourceDayDate) {
      return;
    }

    const slotDayHasChanged = sourceDayDate !== date;

    if (!slotDayHasChanged) {
      setShowSpaceForDraggedSlot(true);
      return;
    }

    const updatedSlot: SlotItemType = {
      ...draggedSlot,
      startTime: draggedSlot.startTime
        ? applyDate(draggedSlot.startTime, date)
        : null,
      endTime: draggedSlot.endTime
        ? applyDate(draggedSlot.endTime, date)
        : null,
      completionStatus: 'auto',
    };

    updateSlotCache(draggedSlot.id, sourceDayDate, date, updatedSlot);
    setShowSpaceForDraggedSlot(true);
  }, [
    draggedSlot,
    date,
    updateSlotCache,
    isCurrentDay,
    sourceDayDate,
    showSpaceForDraggedSlot,
    setShowSpaceForDraggedSlot,
  ]);

  const buildContent = () => {
    if (loading && isCurrentDay && !daySlots) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
      );
    }

    if (!daySlots?.length) {
      return shouldShowEmpty ? <EmptyDayCard /> : null;
    }

    const sortedSlots = [...daySlots].sort((a, b) => {
      // Without time slots first
      if (a.withoutTime && b.withoutTime) return 0;
      if (a.withoutTime) return -1;
      if (b.withoutTime) return 1;

      // No start date slots next
      if (!a.startTime && !b.startTime) return 0;
      if (!a.startTime) return -1;
      if (!b.startTime) return 1;

      // Sort by local time-of-day to avoid timezone offset issues
      const aStart = dayjs(a.startTime);
      const bStart = dayjs(b.startTime);
      const startTimeDiff =
        aStart.diff(aStart.startOf('day')) - bStart.diff(bStart.startOf('day'));

      // If same start time, prioritize no end time
      if (startTimeDiff === 0) {
        if (!a.endTime && !b.endTime) return 0;
        if (!a.endTime) return -1;
        if (!b.endTime) return 1;
        const aEnd = dayjs(a.endTime);
        const bEnd = dayjs(b.endTime);
        return aEnd.diff(aEnd.startOf('day')) - bEnd.diff(bEnd.startOf('day'));
      }

      return startTimeDiff;
    });

    const enhancedData = createEnhancedSlotData(sortedSlots);

    const slots = (
      <>
        {enhancedData.map(item => {
          return item.type === 'slot' ? (
            <SlotItem
              key={item.data.id}
              slot={item.data}
              date={date}
              slotListPanRef={slotListPanRef}
              updateSlotCache={updateSlotCache}
            />
          ) : (
            <RemainingTimeCard
              key={item.id}
              nextActivityStartTime={item.data.nextActivityStartTime}
            />
          );
        })}
      </>
    );

    return slots;
  };

  return (
    <View style={[styles.dayContainer, { width: screenWidth }]}>
      <ControllableScrollView date={date}>
        {buildContent()}
      </ControllableScrollView>
    </View>
  );
};

export const DayPage = memo(DayPageComponent, (prevProps, nextProps) => {
  const nextDate = getDateFromIndex(nextProps.dayIndex);
  const isCurrentDayNext = nextDate === nextProps.selectedDate;

  // Always re-render if this is the current day for drag and drop
  if (isCurrentDayNext) {
    return false;
  }

  // Re-render if cached slots changed for this date
  if (prevProps.cachedSlotsForDate !== nextProps.cachedSlotsForDate) {
    return false;
  }

  return true;
});

DayPage.displayName = 'DayPage';

const styles = StyleSheet.create({
  dayContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: fontSize.base,
    color: colors.typography.secondary,
  },
});
