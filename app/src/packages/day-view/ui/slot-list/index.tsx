import { FC, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { ScrollView, StyleSheet, View, FlatList, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { SlotItem } from '../slot-item';
import { EmptyDayCard } from '../empty-day-card';
import { RemainingTimeCard } from '../remaining-time-card';
import { colors, SlotItem as SlotItemType, useCalendarStore } from '@project/shared';
import { spacing } from '@project/shared';
import dayjs from 'dayjs';

interface SlotListProps {
  slots: SlotItemType[];
  onSlotPress: (slot: SlotItemType) => void;
  getSlotsForDate: (date: string) => SlotItemType[] | undefined;
}

export const SlotList: FC<SlotListProps> = ({ slots: _unusedSlots, onSlotPress, getSlotsForDate }) => {
  const [selectedDate, setSelectedDate] = useCalendarStore.selectedDate();
  const flatListRef = useRef<FlatList<number>>(null);
  const screenWidth = Dimensions.get('window').width;

  // Current center date that drives all page calculations
  const [centerDate, setCenterDate] = useState<string>(selectedDate);

  // Force refresh trigger for dynamic updates
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Large stable array of page indices - never changes
  const pageIndices = useRef<number[]>([]);
  if (pageIndices.current.length === 0) {
    for (let i = -50; i <= 50; i++) {
      pageIndices.current.push(i);
    }
  }
  const centerIndex = 50; // Middle of our array

  const lastShownByDateRef = useRef<Record<string, SlotItemType[]>>({});

  // Create enhanced data with remaining time cards
  const createEnhancedSlotData = useCallback(
    (slots: SlotItemType[]) => {
      if (!slots || slots.length === 0) return [];

      const enhancedData: Array<{ type: 'slot' | 'remaining-time'; data: any; id: string }> = [];
      const now = dayjs();

      for (let i = 0; i < slots.length; i++) {
        const currentSlot = slots[i];
        const nextSlot = slots[i + 1];

        if (!currentSlot) continue;

        // Add current slot
        enhancedData.push({
          type: 'slot',
          data: currentSlot,
          id: `slot-${currentSlot.id?.toString() || i}`,
        });

        // Check if we should add a remaining time card after this slot
        if (nextSlot) {
          const currentEndTime = dayjs(currentSlot.endTime);
          const nextStartTime = dayjs(nextSlot.startTime);
          const gapMs = nextStartTime.diff(currentEndTime);

          // Show remaining time card if:
          // 1. There's a gap between activities (> 0 seconds)
          // 2. The current activity has ended
          // 3. The next activity hasn't started yet (with buffer for animation)
          if (gapMs > 0 && now.isAfter(currentEndTime) && now.isBefore(nextStartTime.add(1, 'second'))) {
            enhancedData.push({
              type: 'remaining-time',
              data: { nextActivityStartTime: nextSlot.startTime },
              id: `remaining-${currentSlot.id}-${nextSlot.id}`, // Use slot IDs for stable keys
            });
          }
        }
      }

      return enhancedData;
    },
    [refreshTrigger]
  );

  // Timer to refresh when slots end and remaining time cards should appear
  useEffect(() => {
    const checkForSlotEndTimes = () => {
      const now = dayjs();
      const todaySlots = getSlotsForDate(selectedDate);

      if (!todaySlots || todaySlots.length === 0) return () => {};

      // Find the next slot end time that's in the future
      let nextEndTime: dayjs.Dayjs | null = null;

      for (const slot of todaySlots) {
        const endTime = dayjs(slot.endTime);
        if (now.isBefore(endTime)) {
          if (!nextEndTime || endTime.isBefore(nextEndTime)) {
            nextEndTime = endTime;
          }
        }
      }

      if (nextEndTime) {
        const msUntilEnd = nextEndTime.diff(now);
        // Set a timeout to refresh when the slot ends
        const timeout = setTimeout(() => {
          setRefreshTrigger(prev => prev + 1);
        }, msUntilEnd + 100); // Add 100ms buffer

        return () => clearTimeout(timeout);
      }

      return () => {};
    };

    return checkForSlotEndTimes();
  }, [selectedDate, getSlotsForDate, refreshTrigger]);

  // Memoize the vertical list renderer with stable dependencies
  const renderVerticalList = useCallback(
    (date: string) => {
      const cacheOrUndefined = getSlotsForDate(date);
      const daySlots = cacheOrUndefined ?? lastShownByDateRef.current[date] ?? null;

      if (!daySlots || daySlots.length === 0) {
        return (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <EmptyDayCard
              onPress={() => {
                const now = dayjs();
                const start = dayjs(`${date} ${now.format('HH:mm')}`);
                const end = start.add(1, 'hour');
                onSlotPress({
                  id: 'default-slot',
                  title: '',
                  startTime: start.toISOString(),
                  endTime: end.toISOString(),
                  type: 'private' as const,
                  visibility: 'private',
                } as any);
              }}
            />
          </ScrollView>
        );
      }

      // Persist last non-empty render for this date
      if (daySlots && daySlots.length > 0) {
        lastShownByDateRef.current[date] = daySlots;
      }

      // Sort slots by start time before processing
      const sortedSlots = [...daySlots].sort((a, b) => dayjs(a.startTime).unix() - dayjs(b.startTime).unix());
      const enhancedData = createEnhancedSlotData(sortedSlots);

      return (
        <FlatList
          data={enhancedData}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            if (item.type === 'slot') {
              return <SlotItem slot={item.data} onPress={onSlotPress} />;
            } else {
              return (
                <RemainingTimeCard
                  nextActivityStartTime={item.data.nextActivityStartTime}
                  onPress={() => {
                    // When pressed, create a new slot from now until the next activity
                    const now = dayjs();
                    const nextActivityStart = dayjs(item.data.nextActivityStartTime);
                    onSlotPress({
                      id: 'default-slot',
                      title: '',
                      startTime: now.toISOString(),
                      endTime: nextActivityStart.toISOString(),
                      type: 'private' as const,
                      visibility: 'private',
                    } as any);
                  }}
                />
              );
            }
          }}
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          // Improved performance settings
          initialNumToRender={5}
          maxToRenderPerBatch={3}
          windowSize={5}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={100}
        />
      );
    },
    [getSlotsForDate, onSlotPress, createEnhancedSlotData]
  );

  const currentPageRef = useRef(centerIndex);
  const baseSelectedDateRef = useRef<string>(selectedDate);

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(x / screenWidth);

    // Only update if we actually moved to a different page
    if (pageIndex !== currentPageRef.current) {
      // Calculate absolute offset from the original starting date
      const absoluteOffset = pageIndex - centerIndex;
      const newDate = dayjs(baseSelectedDateRef.current).add(absoluteOffset, 'day').format('YYYY-MM-DD');

      setCenterDate(newDate);
      setSelectedDate(newDate);
      currentPageRef.current = pageIndex;
    }
  };

  // Sync with external selectedDate changes and reset base reference
  useEffect(() => {
    if (selectedDate !== centerDate) {
      setCenterDate(selectedDate);
      baseSelectedDateRef.current = selectedDate;
      currentPageRef.current = centerIndex; // Reset to center when external date changes
      // Force scroll to center to ensure visual consistency
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: centerIndex, animated: false });
      }, 100);
    }
  }, [selectedDate, centerDate]);

  const pageContainerStyle = useMemo(() => ({ width: screenWidth }), [screenWidth]);

  // Memoize the page item renderer to prevent unnecessary re-renders
  const renderPageItem = useCallback(
    ({ item }: { item: number; index: number }) => {
      const absolutePageOffset = Number(item);
      const date = dayjs(baseSelectedDateRef.current).add(absolutePageOffset, 'day').format('YYYY-MM-DD');
      return (
        <View style={pageContainerStyle} key={`content-${date}`}>
          {renderVerticalList(date)}
        </View>
      );
    },
    [pageContainerStyle, renderVerticalList]
  );

  return (
    <FlatList
      ref={flatListRef}
      data={pageIndices.current}
      keyExtractor={item => `page-${item}`}
      horizontal
      pagingEnabled
      initialNumToRender={3}
      windowSize={5}
      maxToRenderPerBatch={3}
      updateCellsBatchingPeriod={50}
      removeClippedSubviews={true}
      decelerationRate='fast'
      showsHorizontalScrollIndicator={false}
      initialScrollIndex={centerIndex}
      getItemLayout={(_, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
      renderItem={renderPageItem}
      onMomentumScrollEnd={handleMomentumEnd}
    />
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: colors.background.primary,
  },
  content: {
    paddingVertical: spacing.md,
  },
});
