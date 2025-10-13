import { useState, useRef, useEffect, useCallback } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { SCROLL_ANIMATION_TIMEOUT } from '../constants';

export const useScrollControl = (
  flatListRef: React.RefObject<FlatList | null>,
  screenWidth: number,
  calculateTargetIndex: (offsetX: number) => number
) => {
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);
  const scrollEnableTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onScrollCompleteRef = useRef<((newIndex: number) => void) | null>(null);
  const isAnimatingRef = useRef(false);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollEnableTimeoutRef.current) {
        clearTimeout(scrollEnableTimeoutRef.current);
      }
    };
  }, []);

  const enableScrollWithTimeout = useCallback(() => {
    // Clear any existing timeout
    if (scrollEnableTimeoutRef.current) {
      clearTimeout(scrollEnableTimeoutRef.current);
    }

    // Mark as animating
    isAnimatingRef.current = true;
    setIsScrollEnabled(false);

    // Safety timeout: re-enable scroll after timeout if momentum end doesn't fire
    scrollEnableTimeoutRef.current = setTimeout(() => {
      isAnimatingRef.current = false;
      setIsScrollEnabled(true);
      scrollEnableTimeoutRef.current = null;
    }, SCROLL_ANIMATION_TIMEOUT);
  }, []);

  const handleScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      // Ignore if already animating - prevents stacking animations
      if (isAnimatingRef.current) {
        return;
      }

      const { contentOffset: { x: offsetX } } = event.nativeEvent;
      const targetIndex = calculateTargetIndex(offsetX);

      enableScrollWithTimeout();

      // Snap immediately without delay
      flatListRef.current?.scrollToOffset({
        offset: targetIndex * screenWidth,
        animated: true,
      });
    },
    [calculateTargetIndex, enableScrollWithTimeout, flatListRef, screenWidth]
  );

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      // Clear safety timeout since momentum end fired properly
      if (scrollEnableTimeoutRef.current) {
        clearTimeout(scrollEnableTimeoutRef.current);
        scrollEnableTimeoutRef.current = null;
      }

      const { contentOffset: { x: offsetX } } = event.nativeEvent;
      const currentIndex = Math.round(offsetX / screenWidth);

      // Call the callback if it's set
      if (onScrollCompleteRef.current) {
        onScrollCompleteRef.current(currentIndex);
      }

      // Clear animation flag and re-enable scroll
      isAnimatingRef.current = false;
      setIsScrollEnabled(true);
    },
    [screenWidth]
  );

  const scrollToIndex = useCallback(
    (targetIndex: number, animated: boolean = true) => {
      // Prevent programmatic scroll during animation
      if (animated && isAnimatingRef.current) {
        return;
      }

      if (animated) {
        enableScrollWithTimeout();
      }

      flatListRef.current?.scrollToIndex({ index: targetIndex, animated });
    },
    [flatListRef, enableScrollWithTimeout]
  );

  const setOnScrollComplete = useCallback((callback: (newIndex: number) => void) => {
    onScrollCompleteRef.current = callback;
  }, []);

  return {
    isScrollEnabled,
    handleScrollEndDrag,
    handleMomentumScrollEnd,
    scrollToIndex,
    setOnScrollComplete,
  };
};

