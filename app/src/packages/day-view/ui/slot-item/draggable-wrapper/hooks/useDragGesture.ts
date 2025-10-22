import { useCallback } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  SharedValue,
  withSpring,
  AnimatedRef,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import * as Haptics from 'expo-haptics';
import Animated from 'react-native-reanimated';
import { LONG_PRESS_DURATION, TAP_MAX_DURATION } from '../shared/constants';
import { useDraggedSlotContext } from 'node_modules/@project/shared/store/dragged-slot';

interface UseDragGestureProps {
  slotRef: AnimatedRef<Animated.View>;
  index: number;
  onPress: () => void;
  draggedSlotInitialOffsetY: SharedValue<number>;
  setPanState: (state: 'idle' | 'start' | 'end') => void;
  updateZones: (absoluteX: number, absoluteY: number) => void;
}

/**
 * Hook to manage drag gesture (tap and pan)
 */
export const useDragGesture = ({
  slotRef,
  index,
  onPress,
  draggedSlotInitialOffsetY,
  setPanState,
  updateZones,
}: UseDragGestureProps) => {
  const {
    draggedSlotX,
    draggedSlotY,
    draggedSlotOffsetX,
    draggedSlotOffsetY,
    draggedSlotHeight,
    draggedSlotIndex,
    draggedSlotZone,
    draggedSlotHorizontalZone,
    controllableScrollTranslateY,
    setDraggedSlotIndexRN,
  } = useDraggedSlotContext();
  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  //Update snap zones according the controllableScrollView translateY value
  useAnimatedReaction(
    () => controllableScrollTranslateY.value,
    (current, previous) => {
      if (current === previous) return;
    }
  );

  const handlePanStart = useCallback(() => {
    if (slotRef.current) {
      slotRef.current.measure((_x, _y, _width, height, pageX, pageY) => {
        draggedSlotX.value = pageX;
        draggedSlotY.value = pageY;
        draggedSlotHeight.value = height;
        draggedSlotIndex.value = index;
      });
    }
    setPanState('start');
    setDraggedSlotIndexRN(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, [
    slotRef,
    draggedSlotX,
    draggedSlotY,
    draggedSlotHeight,
    draggedSlotIndex,
    index,
    setDraggedSlotIndexRN,
    setPanState,
  ]);

  const handlePanEnd = useCallback(() => {
    setPanState('end');
  }, [setPanState]);

  const tap = Gesture.Tap()
    .maxDuration(TAP_MAX_DURATION)
    .onEnd((_, success) => success && scheduleOnRN(handlePress));

  const pan = Gesture.Pan()
    .activateAfterLongPress(LONG_PRESS_DURATION)
    .shouldCancelWhenOutside(false)
    .onStart(() => {
      draggedSlotInitialOffsetY.value = 0;
      scheduleOnRN(handlePanStart);
    })
    .onUpdate(e => {
      updateZones(e.absoluteX, e.absoluteY);
    })
    .onEnd(() => {
      draggedSlotOffsetX.value = withSpring(0);
      draggedSlotOffsetY.value = withSpring(0, {}, () => {
        draggedSlotIndex.value = null;
        draggedSlotHeight.value = 0;
        draggedSlotZone.value = 'middle';
        draggedSlotHorizontalZone.value = 'middle';
        scheduleOnRN(handlePanEnd);
      });
      draggedSlotZone.value = 'middle';
      draggedSlotHorizontalZone.value = 'middle';
    });

  const gesture = Gesture.Exclusive(tap, pan);

  return { gesture };
};
