import { AnimatedRef } from 'react-native-reanimated';
import Animated, {
  measure,
  useAnimatedReaction,
  useSharedValue,
} from 'react-native-reanimated';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';

/**
 * Hook to manage slot reordering logic
 * Calculates when and how a slot should shift position when another slot is dragged over it
 */
export const useSlotReordering = (
  ref: AnimatedRef<Animated.View>,
  index: number,
  isCurrentDay: boolean
) => {
  const { draggedSlotHeight, draggedSlotMiddleY, draggedSlotIndex } =
    useDraggedSlotContext();
  const offsetY = useSharedValue(0);
  const draggedSlotPosition = useSharedValue<'above' | 'below' | null>(null);

  useAnimatedReaction(
    () => [draggedSlotMiddleY.value, isCurrentDay] as const,
    (current, previous) => {
      const draggedSlotMiddleY = current[0];
      const prevdraggedSlotMiddleY = previous?.[0];
      const isCurrentDayNow = current[1];
      const currentIsDragged = draggedSlotIndex.value === index;

      if (!isCurrentDayNow) return;
      if (draggedSlotIndex.value === null) return;
      if (currentIsDragged) return;
      if (!previous) return;
      if (draggedSlotMiddleY === prevdraggedSlotMiddleY) return;

      const measurement = measure(ref as AnimatedRef<Animated.View>);
      if (!measurement || !measurement!.pageY || !measurement!.height) return;

      const slotMiddleY = measurement.pageY + measurement.height / 2;
      const draggedSlotIsAbove = draggedSlotMiddleY < slotMiddleY;
      if (!draggedSlotPosition.value)
        draggedSlotPosition.value = draggedSlotIsAbove ? 'above' : 'below';
      const draggedSlotWasAbove = draggedSlotPosition.value === 'above';

      if (draggedSlotIsAbove === draggedSlotWasAbove) return;

      let direction: 'up' | 'down';
      if (draggedSlotIsAbove && !draggedSlotWasAbove) direction = 'down';
      else direction = 'up';

      const isSlotWhereAbove = draggedSlotIndex.value > index;

      if (direction === 'up') {
        if (isSlotWhereAbove) {
          offsetY.value = 0;
        } else {
          offsetY.value = -draggedSlotHeight.value;
        }
        draggedSlotPosition.value = 'below';
      } else {
        if (isSlotWhereAbove) {
          offsetY.value = draggedSlotHeight.value;
        } else {
          offsetY.value = 0;
        }
        draggedSlotPosition.value = 'above';
      }
    }
  );

  return {
    offsetY,
  };
};
