import { useWindowDimensions } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { CALENDAR_CONSTANTS } from '@project/shared';

/**
 * Hook to manage zone detection during drag
 * Detects when the dragged slot enters vertical or horizontal scroll zones
 */
export const useZoneDetection = (
  draggedSlotHorizontalZone: SharedValue<'left' | 'middle' | 'right'>
) => {
  const { width: screenWidth } = useWindowDimensions();

  const horizontalEdgeThreshold =
    CALENDAR_CONSTANTS.HORIZONTAL_SCROLL_ZONE_WIDTH;

  /**
   * Update zone detection based on touch position
   * @param absoluteX - Absolute X position of touch
   * @param absoluteY - Absolute Y position of touch
   */
  const updateZones = (absoluteX: number) => {
    'worklet';

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
