import { withTiming } from 'react-native-reanimated';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';

const SNAP_BREAK_ANIMATION_DURATION = 100;

export const useVerticalSnap = () => {
  const {
    draggedSlotOffsetY,
    isVerticalSnapActive,
    verticalSnapThreshold,
    snapTransitionProgress,
    areSwipeButtonsDisabled,
  } = useDraggedSlotContext();

  const applyVerticalSnap = (translationY: number) => {
    'worklet';

    if (areSwipeButtonsDisabled.value) {
      draggedSlotOffsetY.value = translationY;
      return;
    }

    const absVerticalOffset = Math.abs(translationY);
    const threshold = verticalSnapThreshold.value;

    if (isVerticalSnapActive.value) {
      if (absVerticalOffset < threshold) {
        draggedSlotOffsetY.value = 0;
      } else {
        isVerticalSnapActive.value = false;
        snapTransitionProgress.value = 0;
        snapTransitionProgress.value = withTiming(1, {
          duration: SNAP_BREAK_ANIMATION_DURATION,
        });
      }
    } else {
      const progress = snapTransitionProgress.value;

      if (absVerticalOffset < threshold) {
        if (progress > 0) {
          snapTransitionProgress.value = withTiming(
            0,
            {
              duration: SNAP_BREAK_ANIMATION_DURATION,
            },
            finished => {
              if (finished) {
                isVerticalSnapActive.value = true;
              }
            }
          );
        }
        draggedSlotOffsetY.value = translationY * progress;
      } else {
        draggedSlotOffsetY.value = translationY * progress;
      }
    }
  };

  const resetVerticalSnap = () => {
    'worklet';
    isVerticalSnapActive.value = true;
    snapTransitionProgress.value = 0;
  };

  return {
    applyVerticalSnap,
    resetVerticalSnap,
  };
};
