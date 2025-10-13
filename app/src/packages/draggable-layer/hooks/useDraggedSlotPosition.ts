import { useAnimatedStyle } from 'react-native-reanimated';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';

/**
 * Hook to manage the position animation of the dragged slot
 */
export const useDraggedSlotPosition = () => {
  const { 
    draggedSlotX, 
    draggedSlotY, 
    draggedSlotOffsetX, 
    draggedSlotOffsetY 
  } = useDraggedSlotContext();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      top: draggedSlotY.value,
      left: draggedSlotX.value,
      transform: [
        { translateX: draggedSlotOffsetX.value }, 
        { translateY: draggedSlotOffsetY.value }
      ],
    };
  });

  return { animatedStyle };
};

