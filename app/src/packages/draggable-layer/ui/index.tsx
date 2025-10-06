import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useAnimatedReaction, useSharedValue, withTiming, cancelAnimation, Easing } from 'react-native-reanimated';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { CALENDAR_CONSTANTS, colors } from '@project/shared';
import { useRef, useCallback, useEffect } from 'react';
import { scheduleOnRN } from 'react-native-worklets';
import { PortalHost } from 'react-native-teleport';

const CONTINUOUS_SCROLL_DELAY = 1000; // ms between each horizontal scroll
const ZONE_WIDTH_START_MULTIPLIER = 0.5; // Start at 50% of zone width

// Helper to convert hex to rgb values
const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

export const DraggableLayer = () => {
  const { draggedSlotX, draggedSlotY, draggedSlotOffsetX, draggedSlotOffsetY, draggedSlotHorizontalZone, currentDayIndex, flatListScrollToIndex, draggedSlotIndexRN, setPortalEnabled } = useDraggedSlotContext();
  const horizontalScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastHorizontalZone = useSharedValue<'left' | 'right' | 'middle'>('middle');
  const leftZoneOpacity = useSharedValue(0);
  const rightZoneOpacity = useSharedValue(0);
  const leftZoneWidthMultiplier = useSharedValue(ZONE_WIDTH_START_MULTIPLIER);
  const rightZoneWidthMultiplier = useSharedValue(ZONE_WIDTH_START_MULTIPLIER);

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

      // Update zone visibility
      leftZoneOpacity.value = withTiming(zone === 'left' ? 1 : 0, { duration: 200 });
      rightZoneOpacity.value = withTiming(zone === 'right' ? 1 : 0, { duration: 200 });

      // If entering left or right zone, start continuous scrolling and animate width
      if (zone !== 'middle' && zone !== previousZone) {
        lastHorizontalZone.value = zone;
        
        // Animate width from 50% to 100% over CONTINUOUS_SCROLL_DELAY with linear easing
        if (zone === 'left') {
          cancelAnimation(leftZoneWidthMultiplier);
          leftZoneWidthMultiplier.value = ZONE_WIDTH_START_MULTIPLIER;
          leftZoneWidthMultiplier.value = withTiming(1, { duration: CONTINUOUS_SCROLL_DELAY, easing: Easing.linear });
        } else if (zone === 'right') {
          cancelAnimation(rightZoneWidthMultiplier);
          rightZoneWidthMultiplier.value = ZONE_WIDTH_START_MULTIPLIER;
          rightZoneWidthMultiplier.value = withTiming(1, { duration: CONTINUOUS_SCROLL_DELAY, easing: Easing.linear });
        }
        
        // Add initial delay before first scroll
        scheduleOnRN(horizontalScrollWithDelay, zone);
      }

      // If returning to middle, reset width
      if (zone === 'middle') {
        lastHorizontalZone.value = 'middle';
        cancelAnimation(leftZoneWidthMultiplier);
        cancelAnimation(rightZoneWidthMultiplier);
        leftZoneWidthMultiplier.value = withTiming(ZONE_WIDTH_START_MULTIPLIER, { duration: 200 });
        rightZoneWidthMultiplier.value = withTiming(ZONE_WIDTH_START_MULTIPLIER, { duration: 200 });
      }
    }
  );

  // Cleanup timer when drag ends
  useEffect(() => {
    if (draggedSlotIndexRN === null) {
      clearHorizontalTimer();
      cancelAnimation(leftZoneWidthMultiplier);
      cancelAnimation(rightZoneWidthMultiplier);
      leftZoneWidthMultiplier.value = ZONE_WIDTH_START_MULTIPLIER;
      rightZoneWidthMultiplier.value = ZONE_WIDTH_START_MULTIPLIER;
    }
  }, [draggedSlotIndexRN, clearHorizontalTimer, leftZoneWidthMultiplier, rightZoneWidthMultiplier]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearHorizontalTimer();
    };
  }, [clearHorizontalTimer]);

  const navColorRgb = hexToRgb(colors.bottomNavigation.background);
  const navColorWithOpacity = `rgba(${navColorRgb.r}, ${navColorRgb.g}, ${navColorRgb.b}, 0.3)`;

  const leftZoneStyle = useAnimatedStyle(() => ({
    opacity: leftZoneOpacity.value,
    width: CALENDAR_CONSTANTS.HORIZONTAL_SCROLL_ZONE_WIDTH * leftZoneWidthMultiplier.value,
    backgroundColor: navColorWithOpacity,
  }));

  const rightZoneStyle = useAnimatedStyle(() => ({
    opacity: rightZoneOpacity.value,
    width: CALENDAR_CONSTANTS.HORIZONTAL_SCROLL_ZONE_WIDTH * rightZoneWidthMultiplier.value,
    backgroundColor: navColorWithOpacity,
  }));

  // teleport the dragged slot
  useEffect(() => {
    setPortalEnabled(true);
    return () => {
      setPortalEnabled(false);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      top: draggedSlotY.value,
      left: draggedSlotX.value,
      transform: [{ translateX: draggedSlotOffsetX.value }, { translateY: draggedSlotOffsetY.value }],
    };
  });

  return (
    <View style={styles.container} pointerEvents='none'>
      {/* Left scroll zone indicator */}
      <Animated.View style={[styles.leftZone, leftZoneStyle]} />
      
      {/* Right scroll zone indicator */}
      <Animated.View style={[styles.rightZone, rightZoneStyle]} />
      
      {/* Dragged slot */}
      <Animated.View style={[animatedStyle]}>
        <PortalHost name='draggableLayer' />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  leftZone: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: CALENDAR_CONSTANTS.HORIZONTAL_SCROLL_ZONE_WIDTH,
  },
  rightZone: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: CALENDAR_CONSTANTS.HORIZONTAL_SCROLL_ZONE_WIDTH,
  },
});
