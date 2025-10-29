import { memo, useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { SlotItem } from '../../slot-item';
import { EmptyDayCard } from '../../EmptyDayCard';
import { RemainingTimeCard } from '../../RemainingTimeCard';
import { ControllableScrollView } from './ControllableScrollView';
import {
  colors,
  SlotItem as SlotItemType,
  fontSize,
} from '@project/shared';
import { useTranslation } from '@project/i18n';
import dayjs from 'dayjs';
import { getDateFromIndex } from '../shared/utils';
import { useSlotData } from '../shared/hooks';

interface DayPageProps {
  dayIndex: number;
  screenWidth: number;
  loading: boolean;
  slotListPanRef: any;
  updateSlotCache: (
    slotId: string,
    sourceDate: string,
    targetDate: string,
    updatedSlot: SlotItemType
  ) => void;
  slotsCacheRef: React.RefObject<Record<string, SlotItemType[]>>;
  selectedDate: string;
  previousSelectedDate: string | null;
  draggedSlot: SlotItemType | null;
}

const DayPageComponent = ({
  dayIndex,
  screenWidth,
  loading,
  slotListPanRef,
  updateSlotCache,
  slotsCacheRef,
  selectedDate,
  previousSelectedDate,
  draggedSlot,
}: DayPageProps) => {
  const t = useTranslation();
  const date = getDateFromIndex(dayIndex);
  const [showSpaceForDraggedSlot, setShowSpaceForDraggedSlot] = useState(false);
  const isCurrentDay = date === selectedDate;
  const { createEnhancedSlotData, getSlotsForDate } = useSlotData(selectedDate, slotsCacheRef);
  const fetchedSlots = getSlotsForDate(date);

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

    if (showSpaceForDraggedSlot) return;
    if (!previousSelectedDate) return;

    // Create updated slot with new date
    const updatedSlot: SlotItemType = {
      ...draggedSlot,
      startTime: draggedSlot.startTime
        ? draggedSlot.startTime.replace(previousSelectedDate, date)
        : null,
      endTime: draggedSlot.endTime
        ? draggedSlot.endTime.replace(previousSelectedDate, date)
        : null,
    };

    updateSlotCache(draggedSlot.id, previousSelectedDate, date, updatedSlot);
    setShowSpaceForDraggedSlot(true);
  }, [draggedSlot, date, updateSlotCache, isCurrentDay, previousSelectedDate, showSpaceForDraggedSlot, setShowSpaceForDraggedSlot]);

  // Use cache if fetched slots are undefined or empty, but we have cached data
  const daySlots =
    fetchedSlots && fetchedSlots.length > 0 ? fetchedSlots : null;

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
      return <EmptyDayCard />;
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

      // Sort by start time
      const startTimeDiff =
        dayjs(a.startTime).unix() - dayjs(b.startTime).unix();

      // If same start time, prioritize no end time
      if (startTimeDiff === 0) {
        if (!a.endTime && !b.endTime) return 0;
        if (!a.endTime) return -1;
        if (!b.endTime) return 1;
        return dayjs(a.endTime).unix() - dayjs(b.endTime).unix();
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

export const DayPage = memo(DayPageComponent, (_, nextProps) => {
  const nextDate = getDateFromIndex(nextProps.dayIndex);
  const isCurrentDayNext = nextDate === nextProps.selectedDate;
  const isPreviousDayNext = nextDate === nextProps.previousSelectedDate;
  
  if (isCurrentDayNext || isPreviousDayNext) {
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
