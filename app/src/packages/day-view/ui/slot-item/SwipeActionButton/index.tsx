import { colors } from '@project/shared';
import { useDraggedSlotContext } from 'node_modules/@project/shared/store/dragged-slot';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useAnimatedReaction,
  clamp,
  withTiming,
} from 'react-native-reanimated';
import { TrashIcon } from './TrashIcon';
import { SuccessIcon } from './SuccessIcon';
import { useCallback, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { scheduleOnRN } from 'react-native-worklets';
import { SwipeActionButtonProps } from './types';
import { SWIPE_BUTTON_WIDTH, CONTAINER_PADDING_VERTICAL } from './constants';

const BUTTON_WIDTH = SWIPE_BUTTON_WIDTH;

export const SwipeActionButton = ({
  side,
  variant,
  slotDate,
  onAction,
}: SwipeActionButtonProps) => {
  const {
    draggedSlotOffsetX,
    draggedSlot,
    sourceDayDate,
    hasDayChangedDuringDrag,
    setHasDayChangedDuringDrag,
    isVerticalSnapActive,
    isHorizontalSnapActive,
    isDragging,
    isSlotReady,
  } = useDraggedSlotContext();
  const buttonSize = useSharedValue(0);
  const buttonWidth = useSharedValue(0);
  const maxHeight = useSharedValue(500);
  const isHapticsTriggered = useSharedValue(false);
  const hasActionTriggered = useSharedValue(false);
  const wasVerticalSnapActive = useSharedValue(true);
  const isTransitioning = useSharedValue(false);
  const isReleasing = useSharedValue(false);
  const isDayChanged = sourceDayDate && slotDate && sourceDayDate !== slotDate;

  useEffect(() => {
    if (isDayChanged && !hasDayChangedDuringDrag) {
      setHasDayChangedDuringDrag(true);
    }
  }, [isDayChanged, hasDayChangedDuringDrag, setHasDayChangedDuringDrag]);

  const handleActionTrigger = useCallback(() => {
    if (onAction) {
      onAction();
    }
  }, [onAction, side, variant]);

  useAnimatedReaction(
    () => isDragging.value,
    (current, previous) => {
      if (previous && !current) {
        isReleasing.value = true;
        const shouldTriggerAction = hasActionTriggered.value;

        if (shouldTriggerAction) {
          scheduleOnRN(handleActionTrigger);
        }

        buttonSize.value = 0;
        buttonWidth.value = 0;
        isHapticsTriggered.value = false;
        hasActionTriggered.value = false;
        isReleasing.value = false;
      }
    }
  );

  if (hasDayChangedDuringDrag || isDayChanged) {
    return null;
  }

  const triggerHaptics = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, []);

  const isLeftButton = side === 'left';

  useAnimatedReaction(
    () => ({
      offset: draggedSlotOffsetX.value,
      verticalActive: isVerticalSnapActive.value,
      horizontalActive: isHorizontalSnapActive.value,
      isDragging: !!draggedSlot,
      slotReady: isSlotReady.value,
    }),
    (current, previous) => {
      if (!current.isDragging || !current.slotReady) {
        return;
      }

      const nextOffset = current.offset;
      const prevOffset = previous?.offset ?? 0;
      const isVerticalActive = current.verticalActive;
      const isHorizontalActive = current.horizontalActive;
      const wasActive = wasVerticalSnapActive.value;

      if (
        prevOffset === nextOffset &&
        previous?.verticalActive === isVerticalActive &&
        previous?.horizontalActive === isHorizontalActive
      )
        return;

      const rawOffset = nextOffset ?? 0;
      const offset = isLeftButton ? rawOffset : Math.abs(rawOffset);

      if ((isLeftButton && rawOffset < 0) || (!isLeftButton && rawOffset > 0)) {
        return;
      }

      const justBroke = wasActive && !isVerticalActive;
      const justRestored = !wasActive && isVerticalActive;

      if (justBroke) {
        isTransitioning.value = true;
        isHapticsTriggered.value = false;
        hasActionTriggered.value = false;
        buttonSize.value = withTiming(0, { duration: 150 }, finished => {
          if (finished) {
            isTransitioning.value = false;
          }
        });
        buttonWidth.value = withTiming(0, { duration: 150 });
        wasVerticalSnapActive.value = false;
        return;
      }

      if (!isVerticalActive) {
        return;
      }

      if (justRestored) {
        isTransitioning.value = true;
        buttonSize.value = withTiming(offset, { duration: 150 }, finished => {
          if (finished) {
            isTransitioning.value = false;
            const actionConditionsMet =
              offset >= BUTTON_WIDTH && isHorizontalActive;
            if (actionConditionsMet && !isHapticsTriggered.value) {
              scheduleOnRN(triggerHaptics);
              isHapticsTriggered.value = true;
              hasActionTriggered.value = true;
            }
          }
        });
        buttonWidth.value = withTiming(offset, { duration: 150 });
        wasVerticalSnapActive.value = true;
        return;
      }

      if (isTransitioning.value) {
        return;
      }

      buttonSize.value = offset;
      buttonWidth.value = offset;

      const actionConditionsMet = offset >= BUTTON_WIDTH && isHorizontalActive;

      if (actionConditionsMet && !isHapticsTriggered.value) {
        scheduleOnRN(triggerHaptics);
        isHapticsTriggered.value = true;
      } else if (!actionConditionsMet && isHapticsTriggered.value) {
        isHapticsTriggered.value = false;
      }

      if (actionConditionsMet && !hasActionTriggered.value) {
        hasActionTriggered.value = true;
      } else if (
        !isHorizontalActive &&
        hasActionTriggered.value &&
        !isReleasing.value
      ) {
        hasActionTriggered.value = false;
      }
    }
  );

  const animatedStyle = useAnimatedStyle(() => {
    const heightMultiplier = maxHeight.value / 100;
    return {
      width: clamp(buttonSize.value, 0, BUTTON_WIDTH),
      height: clamp(buttonSize.value * heightMultiplier, 0, maxHeight.value),
    };
  });

  const animatedStyleOverlay = useAnimatedStyle(() => {
    const heightMaxedAt = 100;
    const overlayProgress = clamp(
      (buttonSize.value - heightMaxedAt) / (BUTTON_WIDTH - heightMaxedAt),
      0,
      1
    );

    return {
      width: overlayProgress * BUTTON_WIDTH,
      height: overlayProgress * maxHeight.value,
    };
  });

  const buttonColor = variant === 'delete' ? colors.error : colors.success;
  const IconComponent = variant === 'delete' ? TrashIcon : SuccessIcon;
  const containerStyle = isLeftButton
    ? styles.containerLeft
    : styles.containerRight;
  const overlayStyle = isLeftButton ? styles.overlayLeft : styles.overlayRight;

  return (
    <View
      style={[styles.container, containerStyle]}
      onLayout={event => {
        const containerHeight = event.nativeEvent.layout.height;
        maxHeight.value = containerHeight - CONTAINER_PADDING_VERTICAL * 2;
      }}
    >
      <Animated.View
        style={[styles.button, { backgroundColor: buttonColor }, animatedStyle]}
      >
        <Animated.View
          style={[styles.overlay, overlayStyle, animatedStyleOverlay]}
        />
        <IconComponent color={colors.background.primary} side={side} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    height: '100%',
    paddingVertical: CONTAINER_PADDING_VERTICAL,
    justifyContent: 'flex-end',
  },
  containerLeft: {
    left: 0,
  },
  containerRight: {
    right: 0,
  },
  button: {
    width: 100,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    width: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  overlayLeft: {
    left: 0,
    borderTopRightRadius: 36,
  },
  overlayRight: {
    right: 0,
    borderTopLeftRadius: 36,
  },
});
