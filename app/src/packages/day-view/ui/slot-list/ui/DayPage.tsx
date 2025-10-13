import { memo, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { SlotItem } from '../../slot-item';
import { EmptyDayCard } from '../../empty-day-card';
import { RemainingTimeCard } from '../../remaining-time-card';
import { ControllableScrollView } from './ControllableScrollView';
import { colors, SlotItem as SlotItemType, fontSize } from '@project/shared';
import { useTranslation } from '@project/i18n';
import dayjs from 'dayjs';

interface DayPageProps {
  dayIndex: number;
  screenWidth: number;
  getSlotsForDate: (date: string) => SlotItemType[] | undefined;
  onSlotPress: (slot: SlotItemType) => void;
  createEnhancedSlotData: (slots: SlotItemType[]) => Array<{ type: 'slot' | 'remaining-time'; data: any; id: string }>;
  handleRemainingTimeCardPress: (nextActivityStartTime: string) => void;
  handleEmptyDayCardPress: (date: string) => void;
  getDateFromIndex: (index: number) => string;
  selectedDate: string;
  loading: boolean;
  lastShownByDateRef: React.MutableRefObject<Record<string, SlotItemType[]>>;
}

const DayPageComponent = ({
  dayIndex,
  screenWidth,
  getSlotsForDate,
  onSlotPress,
  createEnhancedSlotData,
  handleRemainingTimeCardPress,
  handleEmptyDayCardPress,
  getDateFromIndex,
  selectedDate,
  loading,
  lastShownByDateRef
}: DayPageProps) => {
  const t = useTranslation();
  const date = getDateFromIndex(dayIndex);
  const fetchedSlots = getSlotsForDate(date);
  
  // Use cache if fetched slots are undefined or empty, but we have cached data
  const daySlots = (fetchedSlots && fetchedSlots.length > 0) 
    ? fetchedSlots 
    : lastShownByDateRef.current[date] ?? fetchedSlots ?? null;

  // Update cache in useEffect to avoid race conditions during render
  useEffect(() => {
    if (daySlots?.length) {
      lastShownByDateRef.current[date] = daySlots;
    }
  }, [date, daySlots, lastShownByDateRef]);

  // Render content directly - no useCallback to avoid stale closures
  const renderContent = () => {
    // Only show loading if we're loading AND have no cached data
    if (loading && date === selectedDate && !daySlots) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' />
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
      );
    }

    if (!daySlots?.length) {
      return <EmptyDayCard onPress={() => handleEmptyDayCardPress(date)} />;
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
      const startTimeDiff = dayjs(a.startTime).unix() - dayjs(b.startTime).unix();
      
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

    return enhancedData.map((item, index) => 
      item.type === 'slot' ? (
        <SlotItem 
          key={item.id} 
          index={index}
          slot={item.data} 
          onPress={onSlotPress}
          selectedDate={date}
        />
      ) : (
        <RemainingTimeCard
          key={item.id}
          nextActivityStartTime={item.data.nextActivityStartTime}
          onPress={() => handleRemainingTimeCardPress(item.data.nextActivityStartTime)}
        />
      )
    );
  };

  return (
    <View style={[styles.dayContainer, { width: screenWidth }]}>
      <ControllableScrollView selectedDate={date}>
        {renderContent()}
      </ControllableScrollView>
    </View>
  );
};

export const DayPage = memo(DayPageComponent);

DayPage.displayName = 'DayPage';

const styles = StyleSheet.create({
  dayContainer: {
    flex: 1,
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

