import { ReactNode, forwardRef } from 'react';
import Animated, { AnimatedRef, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { useCalendarStore } from '@project/shared';
import { useSlotReordering } from './hooks';

interface SlotPositionerProps {
  children: ReactNode;
  index: number;
  selectedDate: string;
}

/**
 * Component that handles slot positioning and reordering animations
 * When a slot is dragged, other slots shift to make space for it
 */
export const SlotPositioner = forwardRef<Animated.View, SlotPositionerProps>(
  ({ children, index, selectedDate }, ref) => {
    const [currentSelectedDate] = useCalendarStore.selectedDate();
    const isCurrentDay = selectedDate === currentSelectedDate;
    const { draggedSlotIndex } = useDraggedSlotContext();

    // Hook for reordering logic
    const { offsetY } = useSlotReordering(ref as AnimatedRef<Animated.View>, index, isCurrentDay);

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
  }
);

