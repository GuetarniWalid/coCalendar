import { useCallback } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { SharedValue, withSpring, withTiming, AnimatedRef } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import * as Haptics from 'expo-haptics';
import Animated from 'react-native-reanimated';
import {
  LONG_PRESS_DURATION,
  TAP_MAX_DURATION,
  VERTICAL_SNAP_THRESHOLD,
  HORIZONTAL_SNAP_THRESHOLD,
  HORIZONTAL_BREAK_THRESHOLD,
  SNAP_BREAK_ANIMATION_DURATION,
  DIRECTION_DETECTION_THRESHOLD,
} from '../shared/constants';

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
  isSnapped: SharedValue<boolean>;
  isBreakingSnap: SharedValue<boolean>;
  dragDirection: SharedValue<'vertical' | 'horizontal' | null>;
  lockedOffsetY: SharedValue<number>;
  setDraggedSlotIndexRN: (index: number | null) => void;
  setPanState: (state: 'idle' | 'start' | 'end') => void;
  constrainVerticalOffset: (translation: number) => number;
  updateZones: (absoluteX: number, absoluteY: number) => void;
}

/**
 * Resets snap state to initial values
 */
const resetSnapState = (
  isSnapped: SharedValue<boolean>,
  isBreakingSnap: SharedValue<boolean>,
  dragDirection: SharedValue<'vertical' | 'horizontal' | null>,
  lockedOffsetY: SharedValue<number>
) => {
  'worklet';
  isSnapped.value = true;
  isBreakingSnap.value = false;
  dragDirection.value = null;
  lockedOffsetY.value = 0;
};

/**
 * Snaps slot back to origin with smooth animation
 */
const snapToOrigin = (
  draggedSlotOffsetX: SharedValue<number>,
  draggedSlotOffsetY: SharedValue<number>,
  isSnapped: SharedValue<boolean>,
  isBreakingSnap: SharedValue<boolean>,
  dragDirection: SharedValue<'vertical' | 'horizontal' | null>,
  lockedOffsetY: SharedValue<number>
) => {
  'worklet';
  resetSnapState(isSnapped, isBreakingSnap, dragDirection, lockedOffsetY);
  
  draggedSlotOffsetX.value = withTiming(0, {
    duration: SNAP_BREAK_ANIMATION_DURATION,
  });
  draggedSlotOffsetY.value = withTiming(0, {
    duration: SNAP_BREAK_ANIMATION_DURATION,
  });
  // Trigger medium haptic on re-snap (horizontal path)
  scheduleOnRN(Haptics.impactAsync, Haptics.ImpactFeedbackStyle.Medium);
};

/**
 * Breaks snap horizontally with smooth transition
 * Locks Y to 0 since horizontal break only happens at vertical origin
 */
const breakHorizontalSnap = (
  translationX: number,
  draggedSlotOffsetX: SharedValue<number>,
  draggedSlotOffsetY: SharedValue<number>,
  isSnapped: SharedValue<boolean>,
  isBreakingSnap: SharedValue<boolean>,
  dragDirection: SharedValue<'vertical' | 'horizontal' | null>,
  lockedOffsetY: SharedValue<number>
) => {
  'worklet';
  isSnapped.value = false;
  isBreakingSnap.value = true;
  dragDirection.value = 'horizontal';
  lockedOffsetY.value = 0;
  
  draggedSlotOffsetX.value = withTiming(translationX, {
    duration: SNAP_BREAK_ANIMATION_DURATION,
  }, () => {
    isBreakingSnap.value = false;
  });
  
  draggedSlotOffsetY.value = withTiming(0, {
    duration: SNAP_BREAK_ANIMATION_DURATION,
  });

  scheduleOnRN(Haptics.impactAsync, Haptics.ImpactFeedbackStyle.Medium);
};

/**
 * Breaks snap vertically with a short transition to avoid jump
 */
const breakVerticalSnap = (
  translationY: number,
  draggedSlotOffsetY: SharedValue<number>,
  isSnapped: SharedValue<boolean>,
  isBreakingSnap: SharedValue<boolean>,
  dragDirection: SharedValue<'vertical' | 'horizontal' | null>,
  constrainVerticalOffset: (translation: number) => number
) => {
  'worklet';
  dragDirection.value = 'vertical';
  // mark as not snapped so subsequent updates use free vertical branch
  isSnapped.value = false;
  isBreakingSnap.value = true;
  const targetY = constrainVerticalOffset(translationY);
  draggedSlotOffsetY.value = withTiming(targetY, { duration: SNAP_BREAK_ANIMATION_DURATION }, () => {
    isBreakingSnap.value = false;
  });
};

/**
 * If user returns near origin while in vertical mode, smoothly re-snap vertically.
 * This re-enables the snapped branch so horizontal break can occur again.
 */
const resnapVerticalIfNearOrigin = (
  translationY: number,
  draggedSlotOffsetY: SharedValue<number>,
  isSnapped: SharedValue<boolean>,
  isBreakingSnap: SharedValue<boolean>,
  dragDirection: SharedValue<'vertical' | 'horizontal' | null>
) => {
  'worklet';
  const absOffsetY = Math.abs(translationY);
  if (absOffsetY <= VERTICAL_SNAP_THRESHOLD && dragDirection.value === 'vertical' && !isBreakingSnap.value) {
    isSnapped.value = true;
    dragDirection.value = null;
    draggedSlotOffsetY.value = withTiming(0, { duration: SNAP_BREAK_ANIMATION_DURATION });
    // Trigger medium haptic on re-snap (vertical path)
    scheduleOnRN(Haptics.impactAsync, Haptics.ImpactFeedbackStyle.Medium);
    return true;
  }
  return false;
};

/**
 * Handles vertical movement while in snapped state
 * Snaps to origin if within threshold, otherwise locks to vertical direction
 */
const handleSnappedVerticalMovement = (
  translationY: number,
  draggedSlotOffsetY: SharedValue<number>,
  dragDirection: SharedValue<'vertical' | 'horizontal' | null>,
  isSnapped: SharedValue<boolean>,
  isBreakingSnap: SharedValue<boolean>,
  constrainVerticalOffset: (translation: number) => number
) => {
  'worklet';
  const absOffsetY = Math.abs(translationY);
  const isWithinSnapZone = absOffsetY <= VERTICAL_SNAP_THRESHOLD;
  const shouldLockVertical = dragDirection.value === null && absOffsetY > DIRECTION_DETECTION_THRESHOLD;
  
  if (isWithinSnapZone) {
    draggedSlotOffsetY.value = withTiming(0, { duration: SNAP_BREAK_ANIMATION_DURATION });
    dragDirection.value = null;
  } else if (shouldLockVertical) {
    breakVerticalSnap(translationY, draggedSlotOffsetY, isSnapped, isBreakingSnap, dragDirection, constrainVerticalOffset);
  } else {
    draggedSlotOffsetY.value = constrainVerticalOffset(translationY);
  }
};

/**
 * Handles horizontal movement when direction is locked
 * Re-snaps to origin if within threshold, otherwise allows free horizontal movement
 */
const handleLockedHorizontalMovement = (
  translationX: number,
  draggedSlotOffsetX: SharedValue<number>,
  draggedSlotOffsetY: SharedValue<number>,
  isSnapped: SharedValue<boolean>,
  isBreakingSnap: SharedValue<boolean>,
  dragDirection: SharedValue<'vertical' | 'horizontal' | null>,
  lockedOffsetY: SharedValue<number>
) => {
  'worklet';
  const absOffsetX = Math.abs(translationX);
  const isWithinSnapZone = absOffsetX <= HORIZONTAL_SNAP_THRESHOLD;
  
  if (isWithinSnapZone) {
    snapToOrigin(draggedSlotOffsetX, draggedSlotOffsetY, isSnapped, isBreakingSnap, dragDirection, lockedOffsetY);
  } else {
    draggedSlotOffsetX.value = translationX;
    draggedSlotOffsetY.value = lockedOffsetY.value;
  }
};

/**
 * Routes movement handling based on locked direction
 */
const handleLockedDirectionMovement = (
  translationX: number,
  translationY: number,
  draggedSlotOffsetX: SharedValue<number>,
  draggedSlotOffsetY: SharedValue<number>,
  isSnapped: SharedValue<boolean>,
  isBreakingSnap: SharedValue<boolean>,
  dragDirection: SharedValue<'vertical' | 'horizontal' | null>,
  lockedOffsetY: SharedValue<number>,
  constrainVerticalOffset: (translation: number) => number
) => {
  'worklet';
  
  if (dragDirection.value === 'horizontal') {
    handleLockedHorizontalMovement(
      translationX,
      draggedSlotOffsetX,
      draggedSlotOffsetY,
      isSnapped,
      isBreakingSnap,
      dragDirection,
      lockedOffsetY
    );
  } else if (dragDirection.value === 'vertical') {
    draggedSlotOffsetX.value = 0;
    draggedSlotOffsetY.value = constrainVerticalOffset(translationY);
  }
};

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
  isSnapped,
  isBreakingSnap,
  dragDirection,
  lockedOffsetY,
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
      draggedSlotInitialOffsetY.value = 0;
      resetSnapState(isSnapped, isBreakingSnap, dragDirection, lockedOffsetY);
      scheduleOnRN(handlePanStart);
    })
    .onUpdate(e => {
      const absOffsetX = Math.abs(e.translationX);
      const absOffsetY = Math.abs(e.translationY);
      const isVerticalAtOrigin = absOffsetY <= VERTICAL_SNAP_THRESHOLD;
      const shouldBreakHorizontal = absOffsetX > HORIZONTAL_BREAK_THRESHOLD && isVerticalAtOrigin;

      if (isSnapped.value) {
        if (dragDirection.value === 'vertical') {
          draggedSlotOffsetX.value = 0;
          handleSnappedVerticalMovement(e.translationY, draggedSlotOffsetY, dragDirection, isSnapped, isBreakingSnap, constrainVerticalOffset);
        } else if (shouldBreakHorizontal) {
          breakHorizontalSnap(
            e.translationX,
            draggedSlotOffsetX,
            draggedSlotOffsetY,
            isSnapped,
            isBreakingSnap,
            dragDirection,
            lockedOffsetY
          );
        } else {
          draggedSlotOffsetX.value = 0;
          handleSnappedVerticalMovement(e.translationY, draggedSlotOffsetY, dragDirection, isSnapped, isBreakingSnap, constrainVerticalOffset);
        }
      } else if (!isBreakingSnap.value) {
        // If we're in vertical mode and near origin, re-snap vertically first
        const didResnap = resnapVerticalIfNearOrigin(
          e.translationY,
          draggedSlotOffsetY,
          isSnapped,
          isBreakingSnap,
          dragDirection
        );
        if (!didResnap) {
          handleLockedDirectionMovement(
            e.translationX,
            e.translationY,
            draggedSlotOffsetX,
            draggedSlotOffsetY,
            isSnapped,
            isBreakingSnap,
            dragDirection,
            lockedOffsetY,
            constrainVerticalOffset
          );
        }
      }

      updateZones(e.absoluteX, e.absoluteY);
    })
    .onEnd(() => {
      resetSnapState(isSnapped, isBreakingSnap, dragDirection, lockedOffsetY);
      
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

