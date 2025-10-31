import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedReaction,
  withTiming,
  cancelAnimation,
  Easing,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { CALENDAR_CONSTANTS, getSlotBackgroundColor } from '@project/shared';
import {
  CONTINUOUS_SCROLL_DELAY,
  ZONE_WIDTH_START_MULTIPLIER,
} from '../shared/constants';
import { hexToRgba } from '../shared/utils';

/**
 * Hook to manage visual effects for left and right scroll zones
 * (opacity and width animations)
 */
export const useZoneVisualEffects = () => {
  const { draggedSlotHorizontalZone, draggedSlot } =
    useDraggedSlotContext();

  const leftZoneOpacity = useSharedValue(0);
  const rightZoneOpacity = useSharedValue(0);
  const leftZoneWidthMultiplier = useSharedValue(ZONE_WIDTH_START_MULTIPLIER);
  const rightZoneWidthMultiplier = useSharedValue(ZONE_WIDTH_START_MULTIPLIER);

  // Handle zone visual effects based on horizontal zone
  useAnimatedReaction(
    () => draggedSlotHorizontalZone.value,
    (zone, previousZone) => {
      // Update zone opacity
      leftZoneOpacity.value = withTiming(zone === 'left' ? 1 : 0, {
        duration: 200,
      });
      rightZoneOpacity.value = withTiming(zone === 'right' ? 1 : 0, {
        duration: 200,
      });

      // If entering left or right zone, animate width from 50% to 100%
      if (zone !== 'middle' && zone !== previousZone) {
        if (zone === 'left') {
          cancelAnimation(leftZoneWidthMultiplier);
          leftZoneWidthMultiplier.value = ZONE_WIDTH_START_MULTIPLIER;
          leftZoneWidthMultiplier.value = withTiming(1, {
            duration: CONTINUOUS_SCROLL_DELAY,
            easing: Easing.linear,
          });
        } else if (zone === 'right') {
          cancelAnimation(rightZoneWidthMultiplier);
          rightZoneWidthMultiplier.value = ZONE_WIDTH_START_MULTIPLIER;
          rightZoneWidthMultiplier.value = withTiming(1, {
            duration: CONTINUOUS_SCROLL_DELAY,
            easing: Easing.linear,
          });
        }
      }

      // If returning to middle, reset width
      if (zone === 'middle') {
        cancelAnimation(leftZoneWidthMultiplier);
        cancelAnimation(rightZoneWidthMultiplier);
        leftZoneWidthMultiplier.value = withTiming(
          ZONE_WIDTH_START_MULTIPLIER,
          { duration: 200 }
        );
        rightZoneWidthMultiplier.value = withTiming(
          ZONE_WIDTH_START_MULTIPLIER,
          { duration: 200 }
        );
      }
    }
  );

  // Reset animations when drag ends
  useEffect(() => {
    if (draggedSlot === null) {
      cancelAnimation(leftZoneWidthMultiplier);
      cancelAnimation(rightZoneWidthMultiplier);
      leftZoneWidthMultiplier.value = ZONE_WIDTH_START_MULTIPLIER;
      rightZoneWidthMultiplier.value = ZONE_WIDTH_START_MULTIPLIER;
    }
  }, [draggedSlot, leftZoneWidthMultiplier, rightZoneWidthMultiplier]);

  // Create background color with opacity
  const zoneBackgroundColor = hexToRgba(
     getSlotBackgroundColor(draggedSlot?.color),
    0.6
  );

  // Animated styles for zones
  const leftZoneStyle = useAnimatedStyle(() => ({
    opacity: leftZoneOpacity.value,
    width:
      CALENDAR_CONSTANTS.HORIZONTAL_SCROLL_ZONE_WIDTH *
      leftZoneWidthMultiplier.value,
    backgroundColor: zoneBackgroundColor,
  }));

  const rightZoneStyle = useAnimatedStyle(() => ({
    opacity: rightZoneOpacity.value,
    width:
      CALENDAR_CONSTANTS.HORIZONTAL_SCROLL_ZONE_WIDTH *
      rightZoneWidthMultiplier.value,
    backgroundColor: zoneBackgroundColor,
  }));

  return {
    leftZoneStyle,
    rightZoneStyle,
  };
};
