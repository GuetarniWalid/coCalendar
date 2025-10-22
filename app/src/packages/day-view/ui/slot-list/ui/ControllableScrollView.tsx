import { StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { colors } from '@project/shared';
import Animated, {
  useAnimatedRef,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  cancelAnimation,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { useCalendarStore } from '@project/shared';
import { scheduleOnRN } from 'react-native-worklets';

interface ControllableScrollViewProps {
  children: React.ReactNode;
  selectedDate: string;
}

const SCROLL_SPEED = 500; // Pixels per second

export const ControllableScrollView = ({
  children,
  selectedDate,
}: ControllableScrollViewProps) => {
  const [currentSelectedDate] = useCalendarStore.selectedDate();
  const isCurrentDay = selectedDate === currentSelectedDate;
  const animatedRef = useAnimatedRef<Animated.ScrollView>();
  const { draggedSlotZone, draggedSlotIndexRN, controllableScrollTranslateY } =
    useDraggedSlotContext();
  const [targetScrollPosition, setTargetScrollPosition] = useState<
    number | null
  >(null);
  const contentHeight = useSharedValue(0);
  const scrollViewHeight = useSharedValue(0);
  const dayPageScrollY = useSharedValue(0);

  // Handle vertical zone changes during drag
  useAnimatedReaction(
    () => draggedSlotZone.value,
    zone => {
      if (!isCurrentDay || draggedSlotIndexRN === null) return;

      // Cancel any ongoing animation
      cancelAnimation(controllableScrollTranslateY);

      if (zone === 'middle') {
        // Middle zone - stop at current position
        return;
      }

      const maxScrollY = Math.max(
        0,
        contentHeight.value - scrollViewHeight.value
      );
      const currentScroll = dayPageScrollY.value;
      const currentTranslation = controllableScrollTranslateY.value;

      if (zone === 'bottom') {
        // Calculate distance to scroll down from current position
        const effectiveScroll = currentScroll - currentTranslation;
        const distanceToBottom = maxScrollY - effectiveScroll;
        const duration = (distanceToBottom / SCROLL_SPEED) * 1000;

        // Animate translate y smoothly downward
        const targetTranslation = currentTranslation - distanceToBottom;
        controllableScrollTranslateY.value = withTiming(targetTranslation, {
          duration,
        });
      } else if (zone === 'top') {
        // Calculate distance to scroll up from current position
        const effectiveScroll = currentScroll - currentTranslation;
        const distanceToTop = effectiveScroll;
        const duration = (distanceToTop / SCROLL_SPEED) * 1000;

        // Animate controllableScrollTranslateY smoothly upward
        const targetTranslation = currentTranslation + distanceToTop;
        controllableScrollTranslateY.value = withTiming(targetTranslation, {
          duration,
        });
      }
    }
  );

  // Commit translation to scroll position when drag ends
  useAnimatedReaction(
    () => draggedSlotIndexRN !== null,
    (isSlotTeleported, previousIsSlotTeleported) => {
      if (!isCurrentDay) return;

      // Drag ended
      if (previousIsSlotTeleported && !isSlotTeleported) {
        cancelAnimation(controllableScrollTranslateY);

        // Calculate final scroll position
        const finalScrollY = Math.max(
          0,
          Math.min(
            dayPageScrollY.value - controllableScrollTranslateY.value,
            Math.max(0, contentHeight.value - scrollViewHeight.value)
          )
        );

        scheduleOnRN(setTargetScrollPosition, finalScrollY);
      }
    }
  );

  // Apply scroll position after drag ends

  useEffect(() => {
    if (targetScrollPosition !== null && isCurrentDay && animatedRef.current) {
      animatedRef.current.scrollTo({
        y: targetScrollPosition,
        animated: false,
      });
      dayPageScrollY.value = targetScrollPosition;
      controllableScrollTranslateY.value = 0;
      setTargetScrollPosition(null);
    }
  }, [
    targetScrollPosition,
    isCurrentDay,
    animatedRef,
    dayPageScrollY,
    controllableScrollTranslateY,
  ]);

  const contentAnimatedStyle = useAnimatedStyle(() => {
    if (!isCurrentDay) return {};
    return {
      transform: [{ translateY: controllableScrollTranslateY.value }],
    };
  });

  return (
    <Animated.ScrollView
      ref={animatedRef}
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      onLayout={e => {
        scrollViewHeight.value = e.nativeEvent.layout.height;
      }}
      onContentSizeChange={(_, height) => {
        contentHeight.value = height;
      }}
      onScroll={e => {
        if (isCurrentDay) {
          dayPageScrollY.value = e.nativeEvent.contentOffset.y;
        }
      }}
      scrollEventThrottle={16}
    >
      <Animated.View style={[styles.contentContainer, contentAnimatedStyle]}>
        {children}
      </Animated.View>
    </Animated.ScrollView>
  );
};

ControllableScrollView.displayName = 'ControllableScrollView';

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    backgroundColor: colors.background.primary,
  },
  contentContainer: {
    paddingVertical: 12,
  },
});
