import { useRef, useCallback, useEffect } from 'react';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { CALENDAR_CONSTANTS } from '@project/shared';
import { CONTINUOUS_SCROLL_DELAY } from '../shared/constants';

/**
 * Hook to manage horizontal scrolling when dragging to left or right zones
 */
export const useHorizontalScroll = () => {
  const { 
    draggedSlotHorizontalZone, 
    currentDayIndex, 
    flatListScrollToIndex, 
    draggedSlotIndexRN 
  } = useDraggedSlotContext();
  
  const horizontalScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastHorizontalZone = useSharedValue<'left' | 'right' | 'middle'>('middle');

  // Clear timer helper for horizontal scroll
  const clearHorizontalTimer = useCallback(() => {
    if (horizontalScrollTimerRef.current) {
      clearTimeout(horizontalScrollTimerRef.current);
      horizontalScrollTimerRef.current = null;
    }
  }, []);

  // Continuous horizontal scroll function
  const continuousHorizontalScroll = useCallback(
    (zone: 'left' | 'right') => {
      const currentIndex = currentDayIndex.value;
      let targetIndex = currentIndex;

      if (zone === 'left' && currentIndex > 0) {
        targetIndex = currentIndex - 1;
      } else if (zone === 'right' && currentIndex < CALENDAR_CONSTANTS.TOTAL_DAYS - 1) {
        targetIndex = currentIndex + 1;
      }

      if (targetIndex !== currentIndex && flatListScrollToIndex) {
        flatListScrollToIndex(targetIndex);

        // Schedule next scroll if still in the same zone
        horizontalScrollTimerRef.current = setTimeout(() => {
          if (draggedSlotHorizontalZone.value === zone && draggedSlotIndexRN !== null) {
            continuousHorizontalScroll(zone);
          }
        }, CONTINUOUS_SCROLL_DELAY);
      }
    },
    [currentDayIndex, flatListScrollToIndex, draggedSlotHorizontalZone, draggedSlotIndexRN]
  );

  const horizontalScrollWithDelay = useCallback(
    (zone: 'left' | 'right') => {
      horizontalScrollTimerRef.current = setTimeout(() => {
        if (draggedSlotHorizontalZone.value === zone && draggedSlotIndexRN !== null) {
          continuousHorizontalScroll(zone);
        }
      }, CONTINUOUS_SCROLL_DELAY);
    },
    [draggedSlotHorizontalZone, draggedSlotIndexRN, continuousHorizontalScroll]
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
    if (draggedSlotIndexRN === null) {
      clearHorizontalTimer();
    }
  }, [draggedSlotIndexRN, clearHorizontalTimer]);

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

