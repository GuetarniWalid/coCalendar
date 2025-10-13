import { useWindowDimensions } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { CALENDAR_CONSTANTS } from '@project/shared';
import { VERTICAL_SCROLL_ZONE_TOP_THRESHOLD, VERTICAL_SCROLL_ZONE_BOTTOM_THRESHOLD } from '../shared/constants';

/**
 * Hook to manage zone detection during drag
 * Detects when the dragged slot enters vertical or horizontal scroll zones
 */
export const useZoneDetection = (
  draggedSlotZone: SharedValue<'top' | 'middle' | 'bottom'>,
  draggedSlotHorizontalZone: SharedValue<'left' | 'middle' | 'right'>
) => {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  
  const bottomScreenThresholdY = screenHeight * VERTICAL_SCROLL_ZONE_BOTTOM_THRESHOLD;
  const topScreenThresholdY = screenHeight * VERTICAL_SCROLL_ZONE_TOP_THRESHOLD;
  const horizontalEdgeThreshold = CALENDAR_CONSTANTS.HORIZONTAL_SCROLL_ZONE_WIDTH;

  /**
   * Update zone detection based on touch position
   * @param absoluteX - Absolute X position of touch
   * @param absoluteY - Absolute Y position of touch
   */
  const updateZones = (absoluteX: number, absoluteY: number) => {
    'worklet';
    
    // Vertical zone detection
    if (absoluteY > bottomScreenThresholdY) {
      draggedSlotZone.value = 'bottom';
    } else if (absoluteY < topScreenThresholdY) {
      draggedSlotZone.value = 'top';
    } else {
      draggedSlotZone.value = 'middle';
    }

    // Horizontal zone detection
    if (absoluteX < horizontalEdgeThreshold) {
      draggedSlotHorizontalZone.value = 'left';
    } else if (absoluteX > screenWidth - horizontalEdgeThreshold) {
      draggedSlotHorizontalZone.value = 'right';
    } else {
      draggedSlotHorizontalZone.value = 'middle';
    }
  };

  return {
    updateZones,
  };
};

