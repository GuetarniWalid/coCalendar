import { memo, useEffect, ReactElement } from 'react';
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
  lastShownByDateRef: { current: Record<string, SlotItemType[]> };
  renderedJSXCacheRef: { current: Record<string, ReactElement> };
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
  lastShownByDateRef,
  renderedJSXCacheRef
}: DayPageProps) => {
  const t = useTranslation();
  const date = getDateFromIndex(dayIndex);
  
  // Check if we have cached JSX - return it IMMEDIATELY to prevent grey flash
  const cachedJSX = renderedJSXCacheRef.current[date];
  
  const fetchedSlots = getSlotsForDate(date);
  const cachedSlots = lastShownByDateRef.current[date];
  
  // Use cache if fetched slots are undefined or empty, but we have cached data
  const daySlots = (fetchedSlots && fetchedSlots.length > 0) 
    ? fetchedSlots 
    : cachedSlots ?? fetchedSlots ?? null;

  // Update slot cache in useEffect to avoid race conditions during render
  useEffect(() => {
    if (daySlots?.length) {
      lastShownByDateRef.current[date] = daySlots;
    }
  }, [date, daySlots, lastShownByDateRef]);

  // Build JSX content
  const buildContent = () => {
    // Only show loading if we're loading AND have no cached data AND no cached JSX
    if (loading && date === selectedDate && !daySlots && !cachedJSX) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' />
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
      );
    }

    if (!daySlots?.length) {
      // Don't cache empty state
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

    const slotsJSX = (
      <>
        {enhancedData.map((item, index) => 
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
        )}
      </>
    );
    
    // Cache the built JSX for instant re-render on next mount
    renderedJSXCacheRef.current[date] = slotsJSX;
    
    return slotsJSX;
  };

  // If we have cached JSX and cached slots, return cached JSX immediately
  const content = (cachedJSX && cachedSlots) ? cachedJSX : buildContent();

  return (
    <View style={[styles.dayContainer, { width: screenWidth }]}>
      <ControllableScrollView selectedDate={date}>
        {content}
      </ControllableScrollView>
    </View>
  );
};

export const DayPage = memo(DayPageComponent);

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

