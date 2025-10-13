import { useCallback, useRef, useMemo, useEffect, ReactElement } from 'react';
import { FlatList, Dimensions, View, StyleSheet } from 'react-native';
import { CALENDAR_CONSTANTS, colors } from '@project/shared';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { DayPage } from './DayPage';
import { SlotListProps } from '../shared/types';
import { getDateFromIndex } from '../shared/utils';
import {
  useSlotData,
  usePageSnap,
  useScrollControl,
  useDateNavigation,
} from '../shared/hooks';

export const SlotList = ({
  onSlotPress,
  getSlotsForDate,
  loading = false,
}: SlotListProps) => {
  const flatListRef = useRef<FlatList>(null);
  const screenWidth = Dimensions.get('window').width;
  const { draggedSlotIndexRN } = useDraggedSlotContext();
  
  // JSX cache for instant rendering
  const renderedJSXCacheRef = useRef<Record<string, ReactElement>>({});

  const dayIndices = useMemo(
    () => Array.from({ length: CALENDAR_CONSTANTS.TOTAL_DAYS }, (_, i) => i),
    []
  );

  // Page snap calculation
  const { calculateTargetIndex, handleScrollBeginDrag } = usePageSnap(screenWidth);

  // Scroll control
  const { isScrollEnabled, handleScrollEndDrag, handleMomentumScrollEnd, scrollToIndex, setOnScrollComplete } =
    useScrollControl(flatListRef, screenWidth, calculateTargetIndex);

  // Date navigation (must be before useSlotData to get selectedDate)
  const { selectedDate, handleScrollComplete } = useDateNavigation(scrollToIndex);

  // Slot data management
  const {
    handleRemainingTimeCardPress,
    handleEmptyDayCardPress,
    createEnhancedSlotData,
    lastShownByDateRef,
  } = useSlotData(onSlotPress, selectedDate, getSlotsForDate);


  // Connect scroll complete handler
  useEffect(() => {
    setOnScrollComplete(handleScrollComplete);
  }, [setOnScrollComplete, handleScrollComplete]);

  // Cell renderer with forced background color to prevent grey flash
  const CellRendererComponent = useCallback(
    ({ children, style, ...props }: any) => (
      <View style={[style, styles.cell]} {...props}>
        {children}
      </View>
    ),
    []
  );

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
        keyExtractor={(item) => `day-${item}`}
        horizontal
        pagingEnabled={false}
        scrollEnabled={isScrollEnabled}
        showsHorizontalScrollIndicator={false}
        renderItem={renderDayPage}
        CellRendererComponent={CellRendererComponent}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
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
        updateCellsBatchingPeriod={100}
        decelerationRate={0}
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
