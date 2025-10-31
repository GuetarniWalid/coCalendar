import { FC, ReactNode, useMemo, useRef } from 'react';
import { GestureDetector } from 'react-native-gesture-handler';
import { useDragSlotGesture } from './hooks';
import { SlotItem as SlotItemType } from '@project/shared';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import Animated, {
  AnimatedRef,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { View } from 'react-native';

interface DraggableSlotWrapperProps {
  children: ReactNode;
  onPress: () => void;
  slot: SlotItemType;
  slotListPanRef: AnimatedRef<Animated.View>;
}

/**
 * Wrapper component that makes a slot draggable with gesture handling
 * Orchestrates drag behavior, constraints, and zone detection
 */
export const DraggableSlotWrapper: FC<DraggableSlotWrapperProps> = ({
  children,
  onPress,
  slot,
  slotListPanRef,
}) => {
  const ref = useRef<View>(null);
  const { draggedSlot, draggedSlotOpacity } = useDraggedSlotContext();
  // Hook for drag gesture handling
  const { gesture } = useDragSlotGesture({
    slotRef: ref,
    onPress,
    slot,
    slotListPanRef,
  });

  const isSlotDragged = useMemo(() => {
    return draggedSlot?.id === slot.id;
  }, [draggedSlot, slot]);

  const animatedOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - draggedSlotOpacity.value,
    };
  });

  return (
    <Animated.View ref={ref} style={isSlotDragged ? animatedOpacityStyle : {}}>
      <GestureDetector gesture={gesture}>{children}</GestureDetector>
    </Animated.View>
  );
};
