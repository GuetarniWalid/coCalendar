import { useCallback } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { SharedValue, withSpring, AnimatedRef } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import * as Haptics from 'expo-haptics';
import Animated from 'react-native-reanimated';
import { LONG_PRESS_DURATION, TAP_MAX_DURATION } from '../shared/constants';

interface UseDragGestureProps {
  slotRef: AnimatedRef<Animated.View>;
  index: number;
  onPress: () => void;
  draggedSlotX: SharedValue<number>;
  draggedSlotY: SharedValue<number>;
  draggedSlotOffsetX: SharedValue<number>;
  draggedSlotOffsetY: SharedValue<number>;
  draggedSlotHeight: SharedValue<number>;
  draggedSlotIndex: SharedValue<number | null>;
  draggedSlotZone: SharedValue<'top' | 'middle' | 'bottom'>;
  draggedSlotHorizontalZone: SharedValue<'left' | 'middle' | 'right'>;
  draggedSlotInitialOffsetY: SharedValue<number>;
  setDraggedSlotIndexRN: (index: number | null) => void;
  setPanState: (state: 'idle' | 'start' | 'end') => void;
  constrainVerticalOffset: (translation: number) => number;
  updateZones: (absoluteX: number, absoluteY: number) => void;
}

/**
 * Hook to manage drag gesture (tap and pan)
 */
export const useDragGesture = ({
  slotRef,
  index,
  onPress,
  draggedSlotX,
  draggedSlotY,
  draggedSlotOffsetX,
  draggedSlotOffsetY,
  draggedSlotHeight,
  draggedSlotIndex,
  draggedSlotZone,
  draggedSlotHorizontalZone,
  draggedSlotInitialOffsetY,
  setDraggedSlotIndexRN,
  setPanState,
  constrainVerticalOffset,
  updateZones,
}: UseDragGestureProps) => {
  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

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
      // Initialize constraint with starting position
      draggedSlotInitialOffsetY.value = 0;
      scheduleOnRN(handlePanStart);
    })
    .onUpdate(e => {
      draggedSlotOffsetX.value = e.translationX;
      
      // Apply vertical constraint
      draggedSlotOffsetY.value = constrainVerticalOffset(e.translationY);

      // Update zone detection
      updateZones(e.absoluteX, e.absoluteY);
    })
    .onEnd(() => {
      draggedSlotOffsetX.value = withSpring(0);
      draggedSlotOffsetY.value = withSpring(0, {}, () => {
        // Reset all dragged slot values after animation completes
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

