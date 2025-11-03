import { withTiming } from 'react-native-reanimated';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import * as Haptics from 'expo-haptics';
import { scheduleOnRN } from 'react-native-worklets';

const SNAP_ANIMATION_DURATION = 100;
const BACKWARD_BREAK_DISTANCE = 20;

// ========================================
// HELPER FUNCTIONS
// ========================================

const calculateLockedOffset = (isPositive: boolean, threshold: number) => {
  'worklet';
  return isPositive ? threshold : -threshold;
};

const calculateInterpolatedOffset = (
  lockedPosition: number,
  fingerPosition: number,
  progress: number
) => {
  'worklet';
  return lockedPosition * (1 - progress) + fingerPosition * progress;
};


const shouldBreakSnap = (
  distanceBeyondSnap: number,
  breakThreshold: number,
  movingAwayFromButton: boolean
) => {
  'worklet';
  return distanceBeyondSnap >= breakThreshold && movingAwayFromButton;
};

const shouldBreakBackward = (
  movingAwayFromButton: boolean,
  absOffset: number,
  snapThreshold: number,
  backwardBreakDistance: number
) => {
  'worklet';
  const distanceBackFromSnap = snapThreshold - absOffset;
  return !movingAwayFromButton && distanceBackFromSnap >= backwardBreakDistance;
};

export const useHorizontalSnap = () => {
  const {
    draggedSlotOffsetX,
    isHorizontalSnapActive,
    horizontalSnapThreshold,
    horizontalSnapBreakThreshold,
    horizontalSnapProgress,
    lastHorizontalOffset,
    hasReturnedBelowThreshold,
    snapStartPosition,
    lastAbsOffset,
    hasDayChangedDuringDrag,
    isVerticalSnapActive,
    isSlotReady,
  } = useDraggedSlotContext();

  const triggerSnapHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const startSnapMagnetization = (
    currentOffset: number,
    triggerHaptic: boolean = false
  ) => {
    'worklet';
    snapStartPosition.value = currentOffset;
    isHorizontalSnapActive.value = true;
    hasReturnedBelowThreshold.value = false;
    horizontalSnapProgress.value = 1;
    horizontalSnapProgress.value = withTiming(0, {
      duration: SNAP_ANIMATION_DURATION,
    });

    if (triggerHaptic) {
      scheduleOnRN(triggerSnapHaptic);
    }
  };

  const startSnapBreak = () => {
    'worklet';
    isHorizontalSnapActive.value = false;
    horizontalSnapProgress.value = withTiming(1, {
      duration: SNAP_ANIMATION_DURATION,
    });
  };

  const updateCanResnap = (
    progress: number,
    absOffset: number,
    snapThreshold: number,
    breakThreshold: number
  ) => {
    'worklet';
    const outsideSnapZone = absOffset < snapThreshold || absOffset > snapThreshold + breakThreshold;
    if (progress === 1 && outsideSnapZone) {
      hasReturnedBelowThreshold.value = true;
      horizontalSnapProgress.value = 0;
    }
  };

  const applyHorizontalSnap = (translationX: number) => {
    'worklet';

    if (!isSlotReady.value) {
      draggedSlotOffsetX.value = 0;
      return;
    }

    if (hasDayChangedDuringDrag || !isVerticalSnapActive.value) {
      draggedSlotOffsetX.value = translationX;
      return;
    }

    const absOffset = Math.abs(translationX);
    const snapThreshold = horizontalSnapThreshold.value;
    const breakThreshold = horizontalSnapBreakThreshold.value;

    const isMovingRight = translationX > lastHorizontalOffset.value;
    const isMovingLeft = translationX < lastHorizontalOffset.value;
    const isPositive = translationX > 0;
    const isNegative = translationX < 0;

    const movingAwayFromButton =
      (isPositive && isMovingRight) || (isNegative && isMovingLeft);

    const progress = horizontalSnapProgress.value;
    const isSnapActive = isHorizontalSnapActive.value;
    const isSnappingIn = isSnapActive && progress > 0;
    const isBreakingOut = !isSnapActive && progress > 0 && progress < 1;

    const snapZoneMin = snapThreshold;
    const snapZoneMax = snapThreshold + breakThreshold;
    const wasInSnapZone = lastAbsOffset.value >= snapZoneMin && lastAbsOffset.value <= snapZoneMax;
    const isInSnapZone = absOffset >= snapZoneMin && absOffset <= snapZoneMax;
    const justEnteredSnapZone = !wasInSnapZone && isInSnapZone;

    updateCanResnap(progress, absOffset, snapThreshold, breakThreshold);

    // ========================================
    // STATE 1: NOT_SNAPPED_FREE (progress=0, inactive)
    // ========================================
    if (!isSnapActive && progress === 0) {
      const shouldSnapOnEntry = justEnteredSnapZone && hasReturnedBelowThreshold.value && (
        movingAwayFromButton || !wasInSnapZone
      );

      if (shouldSnapOnEntry) {
        const isResnap = !wasInSnapZone && lastAbsOffset.value > 0;
        startSnapMagnetization(translationX, isResnap);
        const lockedPosition = calculateLockedOffset(isPositive, snapThreshold);
        draggedSlotOffsetX.value = calculateInterpolatedOffset(
          lockedPosition,
          translationX,
          1
        );
      } else {
        draggedSlotOffsetX.value = translationX;
      }
    }
    // ========================================
    // STATE 2: SNAPPING_IN (progress >0, active, animating)
    // ========================================
    else if (isSnappingIn) {
      const lockedPosition = calculateLockedOffset(isPositive, snapThreshold);
      const startPosition = snapStartPosition.value;
      const distanceBeyondSnap = absOffset - snapThreshold;

      if (shouldBreakBackward(movingAwayFromButton, absOffset, snapThreshold, BACKWARD_BREAK_DISTANCE)) {
        startSnapBreak();
      } else if (shouldBreakSnap(distanceBeyondSnap, breakThreshold, movingAwayFromButton)) {
        startSnapBreak();
      }

      draggedSlotOffsetX.value = calculateInterpolatedOffset(
        lockedPosition,
        startPosition,
        progress
      );
    }
    // ========================================
    // STATE 3: FULLY_LOCKED (progress=0, active)
    // ========================================
    else if (isSnapActive && progress === 0) {
      const lockedPosition = calculateLockedOffset(isPositive, snapThreshold);
      const distanceBeyondSnap = absOffset - snapThreshold;

      if (shouldBreakBackward(movingAwayFromButton, absOffset, snapThreshold, BACKWARD_BREAK_DISTANCE)) {
        startSnapBreak();
        draggedSlotOffsetX.value = calculateInterpolatedOffset(
          lockedPosition,
          translationX,
          progress
        );
      } else if (shouldBreakSnap(distanceBeyondSnap, breakThreshold, movingAwayFromButton)) {
        startSnapBreak();
        draggedSlotOffsetX.value = calculateInterpolatedOffset(
          lockedPosition,
          translationX,
          progress
        );
      } else {
        draggedSlotOffsetX.value = lockedPosition;
      }
    }
    // ========================================
    // STATE 4: BREAKING_OUT (progress 0→1, inactive, animating)
    // ========================================
    else if (isBreakingOut) {
      const lockedPosition = calculateLockedOffset(isPositive, snapThreshold);
      draggedSlotOffsetX.value = calculateInterpolatedOffset(
        lockedPosition,
        translationX,
        progress
      );
    }
    // ========================================
    // STATE 5: BROKEN_FREE (progress=1, inactive)
    // ========================================
    else if (!isSnapActive && progress === 1) {
      draggedSlotOffsetX.value = translationX;
    }

    lastHorizontalOffset.value = translationX;
    lastAbsOffset.value = absOffset;
  };

  const resetHorizontalSnap = () => {
    'worklet';
    isHorizontalSnapActive.value = false;
    horizontalSnapProgress.value = 0;
    lastHorizontalOffset.value = 0;
    hasReturnedBelowThreshold.value = true;
    snapStartPosition.value = 0;
    lastAbsOffset.value = 0;
  };

  return {
    applyHorizontalSnap,
    resetHorizontalSnap,
  };
};
