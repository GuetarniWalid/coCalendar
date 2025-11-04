import { FC, useState, useEffect, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, SlotItem } from '@project/shared';
import { TaskChecked } from '@project/icons';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { scheduleOnRN } from 'react-native-worklets';

interface CompletionCheckmarkProps {
  slot: SlotItem;
}

// Helper function to check if the slot's day has passed
const isDayPassed = (startTime: string | null): boolean => {
  if (!startTime) return false;

  const slotDate = new Date(startTime);
  const today = new Date();
  // Set both to start of day for comparison
  slotDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return slotDate < today;
};

export const CompletionCheckmark: FC<CompletionCheckmarkProps> = ({ slot }) => {
  // Calculate initial completion state once
  const [isCompleted, setIsCompleted] = useState<boolean>(() => {
    if (slot.completionStatus === 'completed') return true;
    if (slot.completionStatus === 'incomplete') return false;

    // Auto mode: check time-based completion
    if (!slot.endTime) {
      return isDayPassed(slot.startTime);
    }

    const endTimeDate = new Date(slot.endTime);
    const now = new Date();
    return now > endTimeDate;
  });
  const [shouldRender, setShouldRender] = useState<boolean>(isCompleted);
  const { draggedSlot } = useDraggedSlotContext();
  const isDragged = draggedSlot?.id === slot.id;

  // Animation for TaskChecked slide-in from left
  const slideAnimation = useSharedValue(isCompleted ? 0 : -100);

  const animateCompletion = useCallback(() => {
    setShouldRender(true);
    slideAnimation.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, [slideAnimation]);

  const animateUncompletion = useCallback(() => {
    slideAnimation.value = withTiming(
      -100,
      {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      },
      finished => {
        if (finished) {
          scheduleOnRN(setShouldRender, false);
        }
      }
    );
  }, [slideAnimation]);

  useEffect(() => {
    if (isDragged) {
      setIsCompleted(false);
      return;
    }

    // Explicit completion status takes precedence
    if (slot.completionStatus === 'completed' && !isCompleted) {
      setIsCompleted(true);
      return;
    }

    if (slot.completionStatus === 'incomplete' && isCompleted) {
      setIsCompleted(false);
      return;
    }

    // Only proceed with auto-completion logic if status is 'auto'
    if (slot.completionStatus !== 'auto') return;

    // If no end time, check if the day has passed
    if (!slot.endTime) {
      if (isDayPassed(slot.startTime) && !isCompleted) {
        setIsCompleted(true);
      }
      return;
    }

    // If already completed, nothing to schedule
    if (isCompleted) return;

    // Calculate time remaining until end time
    const endTimeDate = new Date(slot.endTime);
    const now = new Date();
    const timeRemaining = endTimeDate.getTime() - now.getTime();

    // If end time has already passed, show checkmark immediately
    if (timeRemaining <= 0) {
      setIsCompleted(true);
      return;
    }

    // Schedule the completion animation
    const timeoutId = setTimeout(() => {
      setIsCompleted(true);
    }, timeRemaining);

    // Cleanup timeout on unmount or when dependencies change
    return () => clearTimeout(timeoutId);
  }, [
    slot.completionStatus,
    slot.endTime,
    slot.startTime,
    isCompleted,
    isDragged,
  ]);

  useEffect(() => {
    if (isCompleted) animateCompletion();
    else animateUncompletion();
  }, [isCompleted, animateCompletion, animateUncompletion]);

  const animatedCheckmarkStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: `${slideAnimation.value}%` }],
    };
  });

  if (!shouldRender) return null;

  return (
    <Animated.View style={[styles.checkmarkContainer, animatedCheckmarkStyle]}>
      <TaskChecked height={60} color={colors.success} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  checkmarkContainer: {
    position: 'absolute',
    left: -0.01,
    top: 38,
    zIndex: 1,
  },
});
