import { useState, useEffect, useCallback } from 'react';
import { useCalendarStore, CALENDAR_CONSTANTS } from '@project/shared';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { getDateFromIndex, getIndexFromDate } from '../utils';
import { INITIAL_SCROLL_DELAY } from '../constants';

export const useDateNavigation = (
  scrollToIndex: (targetIndex: number, animated: boolean) => void
) => {
  const [selectedDate, setSelectedDate] = useCalendarStore.selectedDate();
  const [isInitialized, setIsInitialized] = useState(false);
  const { currentDayIndex, setFlatListScrollToIndex } = useDraggedSlotContext();

  // Handle date changes from DateSelector
  useEffect(() => {
    const targetIndex = getIndexFromDate(selectedDate);
    currentDayIndex.value = targetIndex;

    if (!isInitialized) {
      setIsInitialized(true);
      setTimeout(() => {
        scrollToIndex(targetIndex, false);
      }, INITIAL_SCROLL_DELAY);
    } else {
      scrollToIndex(targetIndex, true);
    }
  }, [isInitialized, selectedDate, currentDayIndex, scrollToIndex]);

  // Expose scroll function to DraggableLayer
  useEffect(() => {
    setFlatListScrollToIndex(() => (targetIndex: number) => {
      if (targetIndex >= 0 && targetIndex < CALENDAR_CONSTANTS.TOTAL_DAYS) {
        currentDayIndex.value = targetIndex;
        scrollToIndex(targetIndex, true);
      }
    });
  }, [currentDayIndex, setFlatListScrollToIndex, scrollToIndex]);

  const handleScrollComplete = useCallback(
    (newIndex: number) => {
      currentDayIndex.value = newIndex;
      const newDate = getDateFromIndex(newIndex);

      if (newDate !== selectedDate) {
        setSelectedDate(newDate);
      }
    },
    [selectedDate, setSelectedDate, currentDayIndex]
  );

  return {
    selectedDate,
    handleScrollComplete,
  };
};

