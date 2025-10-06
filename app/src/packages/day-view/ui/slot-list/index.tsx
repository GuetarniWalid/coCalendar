import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { FlatList, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { DayPage } from './DayPage';
import { SlotItem as SlotItemType, useCalendarStore, CALENDAR_CONSTANTS } from '@project/shared';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import dayjs from 'dayjs';

interface SlotListProps {
  slots: SlotItemType[];
  onSlotPress: (slot: SlotItemType) => void;
  getSlotsForDate: (date: string) => SlotItemType[] | undefined;
  loading?: boolean;
  selectedDate: string;
}
const GESTURE_THRESHOLD = {
  QUICK_TIME: 300,
  MIN_DISTANCE: 0.1,
  FORWARD_SNAP: 0.15,
  BACKWARD_SNAP: 0.85,
  SLOW_SNAP: 0.5
};

export const SlotList = ({ slots: currentSlots, onSlotPress, getSlotsForDate, loading = false, selectedDate: _propSelectedDate }: SlotListProps) => {
  const [selectedDate, setSelectedDate] = useCalendarStore.selectedDate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const { currentDayIndex, setFlatListScrollToIndex, draggedSlotIndexRN } = useDraggedSlotContext();
  
  const flatListRef = useRef<FlatList>(null);
  const screenWidth = Dimensions.get('window').width;
  const lastShownByDateRef = useRef<Record<string, SlotItemType[]>>({});
  
  const dayIndices = useMemo(() => 
    Array.from({ length: CALENDAR_CONSTANTS.TOTAL_DAYS }, (_, i) => i), 
    []
  );

  const getDateFromIndex = useCallback((index: number) => 
    dayjs(CALENDAR_CONSTANTS.ORIGIN_DATE).add(index, 'day').format('YYYY-MM-DD'), []
  );

  const getIndexFromDate = useCallback((date: string) => 
    dayjs(date).diff(dayjs(CALENDAR_CONSTANTS.ORIGIN_DATE), 'day'), []
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
    currentDayIndex.value = targetIndex;
    
    if (!isInitialized) {
      setIsInitialized(true);
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: targetIndex, animated: false });
      }, 100);
    } else {
      flatListRef.current?.scrollToIndex({ index: targetIndex, animated: true });
    }
  }, [isInitialized, selectedDate, getIndexFromDate, currentDayIndex]);

  useEffect(() => {
    if (selectedDate && currentSlots.length >= 0) {
      lastShownByDateRef.current[selectedDate] = currentSlots;
    }
  }, [selectedDate, currentSlots]);

  // Expose scroll function to DraggableLayer
  useEffect(() => {
    setFlatListScrollToIndex(() => (targetIndex: number) => {
      if (targetIndex >= 0 && targetIndex < CALENDAR_CONSTANTS.TOTAL_DAYS) {
        currentDayIndex.value = targetIndex;
        flatListRef.current?.scrollToIndex({ index: targetIndex, animated: true });
      }
    });
  }, [currentDayIndex, setFlatListScrollToIndex]);

  const renderDayPage = useCallback(({ item: dayIndex }: { item: number }) => {
    return (
      <DayPage
        dayIndex={dayIndex}
        screenWidth={screenWidth}
        getSlotsForDate={getSlotsForDate}
        onSlotPress={onSlotPress}
        createEnhancedSlotData={createEnhancedSlotData}
        handleRemainingTimeCardPress={handleRemainingTimeCardPress}
        handleEmptyDayCardPress={handleEmptyDayCardPress}
        getDateFromIndex={getDateFromIndex}
        selectedDate={selectedDate}
        loading={loading}
        lastShownByDateRef={lastShownByDateRef}
      />
    );
  }, [screenWidth, getSlotsForDate, onSlotPress, createEnhancedSlotData, handleRemainingTimeCardPress, handleEmptyDayCardPress, getDateFromIndex, selectedDate, loading]);

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
    currentDayIndex.value = currentIndex;
    const newDate = getDateFromIndex(currentIndex);
    
    if (newDate !== selectedDate) {
      setSelectedDate(newDate);
    }
  }, [screenWidth, selectedDate, setSelectedDate, getDateFromIndex, currentDayIndex]);

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
      removeClippedSubviews={draggedSlotIndexRN === null}
      updateCellsBatchingPeriod={100}
      decelerationRate={0.92}
    />
  );
};
