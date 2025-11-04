import { FC, ReactNode, useEffect, useRef } from 'react';
import Animated, {
  LinearTransition,
  FadeOutRight,
} from 'react-native-reanimated';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { SlotItem } from '@project/shared';
import { View } from 'react-native';

interface SlotPositionerProps {
  children: ReactNode;
  slot: SlotItem;
  date: string;
}

export const SlotPositioner: FC<SlotPositionerProps> = ({ children, slot }) => {
  const ref = useRef<View>(null);
  const {
    draggedSlot,
    firstOriginalSlotY,
    lastOriginalSlotY,
    setNewDraggedSlotScrollY,
  } = useDraggedSlotContext();

  useEffect(() => {
    if (draggedSlot?.id !== slot.id) return;
    if (!ref.current) return;

    ref.current.measure((_x, y, _width, _height, _pageX, pageY) => {
      firstOriginalSlotY.value = pageY;
      lastOriginalSlotY.value = pageY;
      setNewDraggedSlotScrollY(y);
    });
  }, [draggedSlot]);

  return (
    <Animated.View
      ref={ref}
      layout={LinearTransition}
      exiting={FadeOutRight}
    >
      {children}
    </Animated.View>
  );
};
