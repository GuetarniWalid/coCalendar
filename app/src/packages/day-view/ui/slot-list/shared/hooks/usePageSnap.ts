import { useCallback, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { GestureState } from '../types';
import { GESTURE_THRESHOLD } from '../constants';

export const usePageSnap = (screenWidth: number) => {
  const gestureStateRef = useRef<GestureState>({
    startOffset: 0,
    startTime: 0,
    lastOffset: 0,
  });

  const calculateTargetIndex = useCallback(
    (offsetX: number): number => {
      const gestureDistance = offsetX - gestureStateRef.current.startOffset;
      const gestureTime = Date.now() - gestureStateRef.current.startTime;

      const exactIndex = offsetX / screenWidth;
      const currentPageIndex = Math.floor(exactIndex);
      const transitionProgress = exactIndex - currentPageIndex;

      const isQuickGesture = gestureTime < GESTURE_THRESHOLD.QUICK_TIME;
      const hasMinimumDistance =
        Math.abs(gestureDistance) > screenWidth * GESTURE_THRESHOLD.MIN_DISTANCE;
      const isForwardGesture = gestureDistance > 0;

      let targetIndex = currentPageIndex;

      if (isQuickGesture && hasMinimumDistance) {
        if (isForwardGesture && transitionProgress > GESTURE_THRESHOLD.FORWARD_SNAP) {
          targetIndex = currentPageIndex + 1;
        } else if (!isForwardGesture && transitionProgress < GESTURE_THRESHOLD.BACKWARD_SNAP) {
          targetIndex = currentPageIndex;
        } else {
          targetIndex = Math.round(exactIndex);
        }
      } else {
        targetIndex =
          transitionProgress > GESTURE_THRESHOLD.SLOW_SNAP
            ? currentPageIndex + 1
            : currentPageIndex;
      }

      return targetIndex;
    },
    [screenWidth]
  );

  const handleScrollBeginDrag = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    gestureStateRef.current = {
      startOffset: offsetX,
      startTime: Date.now(),
      lastOffset: offsetX,
    };
  }, []);

  return {
    calculateTargetIndex,
    handleScrollBeginDrag,
  };
};

