import { useRef, useCallback, useEffect } from 'react';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { CONTINUOUS_SCROLL_DELAY } from '../shared/constants';
import { useCalendarStore } from '@project/shared/store/calendar';
import dayjs from 'dayjs';

/**
 * Hook to manage horizontal scrolling when dragging to left or right zones
 */
export const useHorizontalScroll = () => {
  const { draggedSlotHorizontalZone, draggedSlot } = useDraggedSlotContext();
  const [selectedDate, setSelectedDate] = useCalendarStore.selectedDate();
  const [, setChangeAskedBy] = useCalendarStore.changeAskedBy();
  const horizontalScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastHorizontalZone = useSharedValue<'left' | 'right' | 'middle'>(
    'middle'
  );

  // Reference to the selected date to avoid re-rendering
  const selectedDateRef = useRef(selectedDate);
  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  // Clear timer helper for horizontal scroll
  const clearHorizontalTimer = useCallback(() => {
    if (horizontalScrollTimerRef.current) {
      clearTimeout(horizontalScrollTimerRef.current);
      horizontalScrollTimerRef.current = null;
    }
  }, []);

  // Continuous horizontal scroll function
  const continuousHorizontalScroll = useCallback((zone: 'left' | 'right') => {
    let nextDate: string;
    if (zone === 'left') {
      nextDate = dayjs(selectedDateRef.current)
        .subtract(1, 'day')
        .format('YYYY-MM-DD');
    } else {
      nextDate = dayjs(selectedDateRef.current)
        .add(1, 'day')
        .format('YYYY-MM-DD');
    }
    setChangeAskedBy(null);
    setSelectedDate(nextDate);
    selectedDateRef.current = nextDate;

    // Schedule next scroll if still in the same zone
    horizontalScrollTimerRef.current = setTimeout(() => {
      if (draggedSlotHorizontalZone.value === zone) {
        continuousHorizontalScroll(zone);
      }
    }, CONTINUOUS_SCROLL_DELAY);
  }, []);

  const horizontalScrollWithDelay = useCallback(
    (zone: 'left' | 'right') => {
      horizontalScrollTimerRef.current = setTimeout(() => {
        if (draggedSlotHorizontalZone.value === zone && draggedSlot !== null) {
          continuousHorizontalScroll(zone);
        }
      }, CONTINUOUS_SCROLL_DELAY);
    },
    [draggedSlotHorizontalZone, draggedSlot, continuousHorizontalScroll]
  );

  // Handle horizontal zone scrolling - continuous while in zone
  useAnimatedReaction(
    () => draggedSlotHorizontalZone.value,
    (zone, previousZone) => {
      // Clear any existing timer when zone changes
      scheduleOnRN(clearHorizontalTimer);

      // If entering left or right zone, start continuous scrolling
      if (zone !== 'middle' && zone !== previousZone) {
        lastHorizontalZone.value = zone;

        // Add initial delay before first scroll
        scheduleOnRN(horizontalScrollWithDelay, zone);
      }

      // If returning to middle, update zone
      if (zone === 'middle') {
        lastHorizontalZone.value = 'middle';
      }
    }
  );

  // Cleanup timer when drag ends
  useEffect(() => {
    if (draggedSlot === null) {
      clearHorizontalTimer();
    }
  }, [draggedSlot, clearHorizontalTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearHorizontalTimer();
    };
  }, [clearHorizontalTimer]);

  return {
    lastHorizontalZone,
  };
};
