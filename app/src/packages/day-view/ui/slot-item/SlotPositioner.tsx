import { ReactNode, forwardRef } from 'react';
import Animated, { AnimatedRef, measure, useAnimatedReaction, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { useCalendarStore } from '@project/shared';

interface SlotPositionerProps {
  children: ReactNode;
  index: number;
  selectedDate: string;
}

export const SlotPositioner = forwardRef<Animated.View, SlotPositionerProps>(({ children, index, selectedDate }, ref) => {
  const [currentSelectedDate] = useCalendarStore.selectedDate();
  const isCurrentDay = selectedDate === currentSelectedDate;
  const { draggedSlotHeight, draggedSlotMiddleY, draggedSlotIndex, dayPageScrollY } = useDraggedSlotContext();
  const offsetY = useSharedValue(0);
  const draggedSlotPosition = useSharedValue<'above' | 'below' | null>(null);

  useAnimatedReaction(
    () => [draggedSlotMiddleY.value, dayPageScrollY.value, isCurrentDay] as const,
    (current, previous) => {
      const draggedSlotMiddleY = current[0];
      const prevdraggedSlotMiddleY = previous?.[0];
      const isCurrentDayNow = current[2];
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
      if (!draggedSlotPosition.value) draggedSlotPosition.value = draggedSlotIsAbove ? 'above' : 'below';
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

  const animatedSlotStyle = useAnimatedStyle(() => {
    if (!isCurrentDay) return {};
    const isDraggedSlot = draggedSlotIndex.value === index;
    if (isDraggedSlot) {
      return {};
    }

    return {
      transform: [
        {
          translateY: withSpring(offsetY.value),
        },
      ],
    };
  });

  return (
    <Animated.View ref={ref} style={animatedSlotStyle}>
      {children}
    </Animated.View>
  );
});
