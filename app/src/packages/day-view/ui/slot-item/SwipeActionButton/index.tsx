import { colors } from '@project/shared';
import { useDraggedSlotContext } from 'node_modules/@project/shared/store/dragged-slot';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useAnimatedReaction,
  clamp,
} from 'react-native-reanimated';
import { TrashIcon } from './TrashIcon';
import { SuccessIcon } from './SuccessIcon';
import { useCallback, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { scheduleOnRN } from 'react-native-worklets';
import { SwipeActionButtonProps } from './types';

const CONTAINER_PADDING_VERTICAL = 12;
const BUTTON_WIDTH = 115;

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
  } = useDraggedSlotContext();
  const buttonSize = useSharedValue(0);
  const buttonWidth = useSharedValue(0);
  const maxHeight = useSharedValue(500);
  const isHapticsTriggered = useSharedValue(false);
  const hasActionTriggered = useSharedValue(false);
  const isDayChanged = sourceDayDate && slotDate && sourceDayDate !== slotDate;

  useEffect(() => {
    if (isDayChanged && !hasDayChangedDuringDrag) {
      setHasDayChangedDuringDrag(true);
    }
  }, [isDayChanged, hasDayChangedDuringDrag, setHasDayChangedDuringDrag]);

  useEffect(() => {
    if (!draggedSlot) {
      buttonSize.value = 0;
      buttonWidth.value = 0;
      isHapticsTriggered.value = false;
      hasActionTriggered.value = false;
    }
  }, [draggedSlot, buttonSize, buttonWidth, isHapticsTriggered, hasActionTriggered]);

  if (hasDayChangedDuringDrag || isDayChanged) {
    return null;
  }

  const triggerHaptics = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, []);

  const triggerAction = useCallback(() => {
    if (onAction) {
      onAction();
    }
  }, [onAction]);

  const isLeftButton = side === 'left';

  useAnimatedReaction(
    () => draggedSlotOffsetX.value,
    (nextOffset, prevOffset) => {
      if (prevOffset === nextOffset) return;

      const rawOffset = nextOffset ?? 0;
      const offset = isLeftButton ? rawOffset : Math.abs(rawOffset);

      if ((isLeftButton && rawOffset < 0) || (!isLeftButton && rawOffset > 0)) {
        return;
      }

      buttonSize.value = offset;
      buttonWidth.value = offset;

      if (offset >= BUTTON_WIDTH && !isHapticsTriggered.value) {
        scheduleOnRN(triggerHaptics);
        isHapticsTriggered.value = true;
      } else if (offset < BUTTON_WIDTH && isHapticsTriggered.value) {
        isHapticsTriggered.value = false;
      }

      if (offset >= BUTTON_WIDTH && !hasActionTriggered.value) {
        hasActionTriggered.value = true;
        scheduleOnRN(triggerAction);
      } else if (offset < BUTTON_WIDTH && hasActionTriggered.value) {
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
  const containerStyle = isLeftButton ? styles.containerLeft : styles.containerRight;
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
        <Animated.View style={[styles.overlay, overlayStyle, animatedStyleOverlay]} />
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
