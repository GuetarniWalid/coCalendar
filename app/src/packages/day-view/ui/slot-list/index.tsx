import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, FlatList, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { SlotItem } from '../slot-item';
import { EmptyDayCard } from '../empty-day-card';
import { SlotItem as SlotItemType, useCalendarStore } from '@project/shared';
import { spacing } from '@project/shared';
import dayjs from 'dayjs';

interface SlotListProps {
  slots: SlotItemType[];
  onSlotPress: (slot: SlotItemType) => void;
  getSlotsForDate: (date: string) => SlotItemType[] | undefined;
}

export const SlotList: FC<SlotListProps> = ({
  slots: _unusedSlots,
  onSlotPress,
  getSlotsForDate,
}) => {
  // Single source of truth from Teaful store
  const [selectedDate, setSelectedDate] = useCalendarStore.selectedDate();
  const flatListRef = useRef<FlatList<number>>(null);
  const screenWidth = Dimensions.get('window').width;
  
  // Current center date that drives all page calculations
  const [centerDate, setCenterDate] = useState<string>(selectedDate);
  
  // Large stable array of page indices - never changes
  const pageIndices = useRef<number[]>([]);
  if (pageIndices.current.length === 0) {
    for (let i = -50; i <= 50; i++) {
      pageIndices.current.push(i);
    }
  }
  const centerIndex = 50; // Middle of our array

  const lastShownByDateRef = useRef<Record<string, SlotItemType[]>>({});

  const renderVerticalList = useCallback((date: string) => {
    const cacheOrUndefined = getSlotsForDate(date);
    const daySlots = cacheOrUndefined ?? lastShownByDateRef.current[date] ?? null;
    if (!daySlots || daySlots.length === 0) {
      return (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <EmptyDayCard onPress={() => {
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
          }} />
        </ScrollView>
      );
    }
    // Persist last non-empty render for this date, so we never flash empty
    if (daySlots && daySlots.length > 0) {
      lastShownByDateRef.current[date] = daySlots;
    }
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {daySlots.map((slot) => (
          <SlotItem
            key={slot.id}
            slot={slot}
            onPress={onSlotPress}
          />
        ))}
      </ScrollView>
    );
  }, [getSlotsForDate, onSlotPress]);

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

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={pageIndices.current}
        keyExtractor={(item) => `page-${item}`}
        horizontal
        pagingEnabled
        initialNumToRender={5}
        windowSize={7}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={0}
        removeClippedSubviews={false}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={centerIndex}
        getItemLayout={(_, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
        renderItem={({ item }) => {
          // Simple: each page shows baseDate + its absolute offset
          const absolutePageOffset = Number(item);
          const date = dayjs(baseSelectedDateRef.current).add(absolutePageOffset, 'day').format('YYYY-MM-DD');
          return (
            <View style={{ width: screenWidth }} key={`content-${date}`}>
              {renderVerticalList(date)}
            </View>
          );
        }}
        onMomentumScrollEnd={handleMomentumEnd}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  content: {
    paddingVertical: spacing.md,
  },
});