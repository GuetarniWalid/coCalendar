import {
  useCallback,
  useRef,
  useMemo,
  useEffect,
  ReactElement,
  useState,
} from 'react';
import {
  FlatList,
  Dimensions,
  View,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { CALENDAR_CONSTANTS, colors, useCalendarStore } from '@project/shared';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { DayPage } from './DayPage';
import { SlotListProps } from '../shared/types';
import { getDateFromIndex, getIndexFromDate } from '../shared/utils';
import { useSlotData } from '../shared/hooks';

export const SlotList = ({
  onSlotPress,
  getSlotsForDate,
  loading = false,
}: SlotListProps) => {
  const flatListRef = useRef<FlatList>(null);
  const screenWidth = Dimensions.get('window').width;
  const { draggedSlotIndexRN } = useDraggedSlotContext();
  const [selectedDate, setSelectedDate] = useCalendarStore.selectedDate();
  const [isInitialized, setIsInitialized] = useState(false);
  // JSX cache for instant rendering
  const renderedJSXCacheRef = useRef<Record<string, ReactElement>>({});

  const dayIndices = useMemo(
    () => Array.from({ length: CALENDAR_CONSTANTS.TOTAL_DAYS }, (_, i) => i),
    []
  );

  // Scroll control
  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {
        contentOffset: { x: offsetX },
      } = event.nativeEvent;
      const currentIndex = Math.round(offsetX / screenWidth);
      const newDate = getDateFromIndex(currentIndex);
      setSelectedDate(newDate);
    },
    [screenWidth]
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
      flatListRef.current?.scrollToIndex({
        index: targetIndex,
        animated: true,
      });
    }
  }, [isInitialized, selectedDate]);

  // Slot data management
  const {
    handleRemainingTimeCardPress,
    handleEmptyDayCardPress,
    createEnhancedSlotData,
    lastShownByDateRef,
  } = useSlotData(onSlotPress, selectedDate, getSlotsForDate);

  const renderDayPage = useCallback(
    ({ item: dayIndex }: { item: number }) => {
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
          renderedJSXCacheRef={renderedJSXCacheRef}
        />
      );
    },
    [
      screenWidth,
      selectedDate,
      loading,
      getSlotsForDate,
      onSlotPress,
      createEnhancedSlotData,
      handleRemainingTimeCardPress,
      handleEmptyDayCardPress,
      lastShownByDateRef,
    ]
  );

  return (
    <View style={styles.container}>
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
        removeClippedSubviews={draggedSlotIndexRN === null}
      />
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
