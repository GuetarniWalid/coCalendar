import { FC, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { StyleSheet, View, FlatList, ScrollView, Dimensions, NativeScrollEvent, NativeSyntheticEvent, ActivityIndicator, Text } from 'react-native';
import { SlotItem } from '../slot-item';
import { EmptyDayCard } from '../empty-day-card';
import { RemainingTimeCard } from '../remaining-time-card';
import { colors, SlotItem as SlotItemType, useCalendarStore, fontSize } from '@project/shared';
import { spacing } from '@project/shared';
import { useTranslation } from '@project/i18n';
import dayjs from 'dayjs';

interface SlotListProps {
  slots: SlotItemType[];
  onSlotPress: (slot: SlotItemType) => void;
  getSlotsForDate: (date: string) => SlotItemType[] | undefined;
  loading?: boolean;
  selectedDate: string;
}

const TOTAL_DAYS = 7305;
const ORIGIN_DATE = '2020-01-01';
const GESTURE_THRESHOLD = {
  QUICK_TIME: 300,
  MIN_DISTANCE: 0.1,
  FORWARD_SNAP: 0.15,
  BACKWARD_SNAP: 0.85,
  SLOW_SNAP: 0.5
};

export const SlotList: FC<SlotListProps> = ({ slots: currentSlots, onSlotPress, getSlotsForDate, loading = false, selectedDate: _propSelectedDate }) => {
  const t = useTranslation();
  const [selectedDate, setSelectedDate] = useCalendarStore.selectedDate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const screenWidth = Dimensions.get('window').width;
  const lastShownByDateRef = useRef<Record<string, SlotItemType[]>>({});
  
  const dayIndices = useMemo(() => 
    Array.from({ length: TOTAL_DAYS }, (_, i) => i), 
    []
  );


  const getDateFromIndex = useCallback((index: number) => 
    dayjs(ORIGIN_DATE).add(index, 'day').format('YYYY-MM-DD'), []
  );

  const getIndexFromDate = useCallback((date: string) => 
    dayjs(date).diff(dayjs(ORIGIN_DATE), 'day'), []
  );

  const createDefaultSlot = useCallback((startTime: string, endTime: string) => ({
    id: 'default-slot',
    title: '',
    startTime,
    endTime,
    type: 'private' as const,
    visibility: 'private',
  } as any), []);

  const handleRemainingTimeCardPress = useCallback((nextActivityStartTime: string) => {
    const now = dayjs();
    const nextActivityStart = dayjs(nextActivityStartTime);
    onSlotPress(createDefaultSlot(now.toISOString(), nextActivityStart.toISOString()));
  }, [onSlotPress, createDefaultSlot]);

  const handleEmptyDayCardPress = useCallback((date: string) => {
    const now = dayjs();
    const start = dayjs(`${date} ${now.format('HH:mm')}`);
    const end = start.add(1, 'hour');
    onSlotPress(createDefaultSlot(start.toISOString(), end.toISOString()));
  }, [onSlotPress, createDefaultSlot]);

  const createEnhancedSlotData = useCallback((slots: SlotItemType[]) => {
    if (!slots?.length) return [];

    const enhancedData: Array<{ type: 'slot' | 'remaining-time'; data: any; id: string }> = [];
    const now = dayjs();

    slots.forEach((currentSlot, i) => {
      const nextSlot = slots[i + 1];
      
      enhancedData.push({
        type: 'slot',
        data: currentSlot,
        id: `slot-${currentSlot.id?.toString() || i}`,
      });

      if (nextSlot && nextSlot.startTime) {
        const currentReferenceTime = currentSlot.endTime 
          ? dayjs(currentSlot.endTime)
          : currentSlot.startTime 
            ? dayjs(currentSlot.startTime) 
            : null;
        
        if (currentReferenceTime) {
          const nextStartTime = dayjs(nextSlot.startTime);
          const gapMs = nextStartTime.diff(currentReferenceTime);
          const showRemainingCard = gapMs > 0 && 
            now.isAfter(currentReferenceTime) && 
            now.isBefore(nextStartTime.add(1, 'second'));

          if (showRemainingCard) {
            enhancedData.push({
              type: 'remaining-time',
              data: { nextActivityStartTime: nextSlot.startTime },
              id: `remaining-${currentSlot.id}-${nextSlot.id}`,
            });
          }
        }
      }
    });

    return enhancedData;
  }, [refreshTrigger]);

  useEffect(() => {
    const todaySlots = getSlotsForDate(selectedDate);
    if (!todaySlots?.length) return;

    const now = dayjs();
    const nextEndTime = todaySlots
      .filter(slot => slot.endTime) // Only consider slots with end times
      .map(slot => dayjs(slot.endTime!))
      .filter(endTime => now.isBefore(endTime))
      .sort((a, b) => a.unix() - b.unix())[0];

    if (!nextEndTime) return;

    const timeout = setTimeout(() => {
      setRefreshTrigger(prev => prev + 1);
    }, nextEndTime.diff(now) + 100);

    return () => clearTimeout(timeout);
  }, [selectedDate, getSlotsForDate, refreshTrigger]);

  useEffect(() => {
    const targetIndex = getIndexFromDate(selectedDate);
    
    if (!isInitialized) {
      setIsInitialized(true);
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: targetIndex, animated: false });
      }, 100);
    } else {
      flatListRef.current?.scrollToIndex({ index: targetIndex, animated: true });
    }
  }, [isInitialized, selectedDate, getIndexFromDate]);

  useEffect(() => {
    if (selectedDate && currentSlots.length >= 0) {
      lastShownByDateRef.current[selectedDate] = currentSlots;
    }
  }, [selectedDate, currentSlots]);

  const renderDayPage = useCallback(({ item: dayIndex }: { item: number }) => {
    const date = getDateFromIndex(dayIndex);
    const daySlots = getSlotsForDate(date) ?? lastShownByDateRef.current[date] ?? null;

    if (daySlots?.length) {
      lastShownByDateRef.current[date] = daySlots;
    }

    const renderContent = () => {
      if (loading && date === selectedDate) {
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

      return enhancedData.map((item) => 
        item.type === 'slot' ? (
          <SlotItem 
            key={item.id} 
            slot={item.data} 
            onPress={onSlotPress} 
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
        <ScrollView 
          style={styles.dayScrollView} 
          contentContainerStyle={styles.dayContent} 
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </ScrollView>
      </View>
    );
  }, [screenWidth, getSlotsForDate, onSlotPress, createEnhancedSlotData, handleRemainingTimeCardPress, handleEmptyDayCardPress, getDateFromIndex, selectedDate, loading, t]);

  const gestureStateRef = useRef({ startOffset: 0, startTime: 0, lastOffset: 0 });

  const handleScrollBeginDrag = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    gestureStateRef.current = { startOffset: offsetX, startTime: Date.now(), lastOffset: offsetX };
  }, []);

  const handleScrollEndDrag = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset: { x: offsetX } } = event.nativeEvent;
    const gestureDistance = offsetX - gestureStateRef.current.startOffset;
    const gestureTime = Date.now() - gestureStateRef.current.startTime;
    
    const exactIndex = offsetX / screenWidth;
    const currentPageIndex = Math.floor(exactIndex);
    const transitionProgress = exactIndex - currentPageIndex;
    
    const isQuickGesture = gestureTime < GESTURE_THRESHOLD.QUICK_TIME;
    const hasMinimumDistance = Math.abs(gestureDistance) > screenWidth * GESTURE_THRESHOLD.MIN_DISTANCE;
    const isForwardGesture = gestureDistance > 0;
    
    let targetIndex = currentPageIndex;
    
    if (isQuickGesture && hasMinimumDistance) {
      if (isForwardGesture && transitionProgress > GESTURE_THRESHOLD.FORWARD_SNAP) {
        targetIndex = currentPageIndex + 1;
      } else if (!isForwardGesture && transitionProgress < GESTURE_THRESHOLD.BACKWARD_SNAP) {
        targetIndex = currentPageIndex;
      } else {
        targetIndex = Math.round(exactIndex);
      }
    } else {
      targetIndex = transitionProgress > GESTURE_THRESHOLD.SLOW_SNAP ? currentPageIndex + 1 : currentPageIndex;
    }
    
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({ 
        offset: targetIndex * screenWidth, 
        animated: true 
      });
    }, 10);
  }, [screenWidth]);

  const handleMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset: { x: offsetX } } = event.nativeEvent;
    const currentIndex = Math.round(offsetX / screenWidth);
    const newDate = getDateFromIndex(currentIndex);
    
    if (newDate !== selectedDate) {
      setSelectedDate(newDate);
    }
  }, [screenWidth, selectedDate, setSelectedDate, getDateFromIndex]);

  return (
    <FlatList
      ref={flatListRef}
      data={dayIndices}
      keyExtractor={item => `day-${item}`}
      horizontal
      pagingEnabled={false}
      showsHorizontalScrollIndicator={false}
      renderItem={renderDayPage}
      onScrollBeginDrag={handleScrollBeginDrag}
      onScrollEndDrag={handleScrollEndDrag}
      onMomentumScrollEnd={handleMomentumScrollEnd}
      getItemLayout={(_, index) => ({ 
        length: screenWidth, 
        offset: screenWidth * index, 
        index 
      })}
      initialNumToRender={3}
      maxToRenderPerBatch={3}
      windowSize={7}
      removeClippedSubviews
      updateCellsBatchingPeriod={100}
      decelerationRate={0.92}
    />
  );
};

const styles = StyleSheet.create({
  dayContainer: {
    flex: 1,
  },
  dayScrollView: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: colors.background.primary,
  },
  dayContent: {
    paddingVertical: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.base,
    color: colors.typography.secondary,
  },
});