import { useCallback, useRef, useMemo, useEffect, useState } from 'react';
import {
  FlatList,
  Dimensions,
  View,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { CALENDAR_CONSTANTS, colors, useCalendarStore } from '@project/shared';
import { DayPage } from './DayPage';
import { SlotListProps } from '../shared/types';
import { getDateFromIndex, getIndexFromDate } from '../shared/utils';
import { useDragSlotListGesture } from '../hook/useDragSlotListGesture';
import { GestureDetector } from 'react-native-gesture-handler';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';

export const SlotList = ({
  loading = false,
  handleSlotDropped,
  updateSlotCache,
  slotsCacheRef,
  cacheVersion,
}: SlotListProps) => {
  const screenWidth = Dimensions.get('window').width;
  const [selectedDate, setSelectedDate] = useCalendarStore.selectedDate();
  const [changeAskedBy, setChangeAskedBy] = useCalendarStore.changeAskedBy();
  const [isInitialized, setIsInitialized] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { draggedSlot } = useDraggedSlotContext();

  const dayIndices = useMemo(
    () => Array.from({ length: CALENDAR_CONSTANTS.TOTAL_DAYS }, (_, i) => i),
    []
  );

  // End scroll
  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {
        contentOffset: { x: offsetX },
      } = event.nativeEvent;
      const currentIndex = Math.round(offsetX / screenWidth);
      const newDate = getDateFromIndex(currentIndex);
      setChangeAskedBy('slotList');
      setSelectedDate(newDate);
    },
    [screenWidth, setChangeAskedBy, setSelectedDate]
  );

  // Handle date changes from DateSelector
  useEffect(() => {
    const targetIndex = getIndexFromDate(selectedDate);

    if (!isInitialized) {
      setIsInitialized(true);
      flatListRef.current?.scrollToIndex({
        index: targetIndex,
        animated: false,
      });
    } else {
      if (changeAskedBy === 'slotList') return;
      flatListRef.current?.scrollToIndex({
        index: targetIndex,
        animated: true,
      });
    }
  }, [isInitialized, selectedDate]);

  // Keep track of slot gesture
  const { gesture, slotListPanRef } = useDragSlotListGesture({
    handleSlotDropped,
  });

  const renderDayPage = useCallback(
    ({ item: dayIndex }: { item: number }) => {
      const date = getDateFromIndex(dayIndex);
      const cachedSlots = slotsCacheRef.current?.[date] ?? undefined;

      return (
        <DayPage
          dayIndex={dayIndex}
          screenWidth={screenWidth}
          loading={loading}
          slotListPanRef={slotListPanRef as any}
          updateSlotCache={updateSlotCache}
          selectedDate={selectedDate}
          draggedSlot={draggedSlot}
          cachedSlotsForDate={cachedSlots}
        />
      );
    },
    [
      screenWidth,
      loading,
      selectedDate,
      draggedSlot,
      slotsCacheRef,
      cacheVersion,
      updateSlotCache,
    ]
  );

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <FlatList
          ref={flatListRef}
          data={dayIndices}
          horizontal
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          renderItem={renderDayPage}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={7}
          removeClippedSubviews={false}
        />
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  cell: {
    backgroundColor: colors.background.primary,
  },
});
