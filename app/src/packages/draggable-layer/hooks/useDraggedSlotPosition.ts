import { useAnimatedStyle } from 'react-native-reanimated';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';

type UseDraggedSlotPositionProps = {
  padding: number;
};

/**
 * Hook to manage the position animation of the dragged slot
 */
export const useDraggedSlotPosition = ({
  padding,
}: UseDraggedSlotPositionProps) => {
  const { draggedSlotX, draggedSlotY, draggedSlotOffsetX, draggedSlotOffsetY } =
    useDraggedSlotContext();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      top: draggedSlotY.value,
      left: draggedSlotX.value - padding,
      transform: [
        { translateX: draggedSlotOffsetX.value },
        { translateY: draggedSlotOffsetY.value },
      ],
    };
  });

  return { animatedStyle };
};
