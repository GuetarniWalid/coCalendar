import { FC, useState, useEffect, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { colors } from '@project/shared';
import { TaskChecked } from '@project/icons';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';
import { scheduleOnRN } from 'react-native-worklets';

interface CompletionCheckmarkProps {
  completed: boolean | undefined;
  endTime: string | null;
  index: number;
}

export const CompletionCheckmark: FC<CompletionCheckmarkProps> = ({ completed, endTime, index }) => {
  // Calculate initial completion state once
  const [isCompleted, setIsCompleted] = useState<boolean>(() => {
    if (completed === true) return true;

    // If no end time, slot can't be auto-completed based on time
    if (!endTime) return false;

    // Check if current time is after end time
    const endTimeDate = new Date(endTime);
    const now = new Date();
    return now > endTimeDate;
  });
  const [shouldRender, setShouldRender] = useState<boolean>(isCompleted);
  const { draggedSlotIndexRN } = useDraggedSlotContext();
  const isDragged = draggedSlotIndexRN === index;

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
    slideAnimation.value = withTiming(-100, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    }, (finished) => {
      if (finished) {
        scheduleOnRN(setShouldRender, false);
      }
    });
  }, [slideAnimation]);

  useEffect(() => {
    if (isDragged) return;

    // If manually completed, show checkmark immediately
    if (completed === true && !isCompleted && !isDragged) {
      setIsCompleted(true);
      return;
    }

    // If no end time or already completed, nothing to schedule
    if (!endTime || isCompleted || !isDragged) return;

    // Calculate time remaining until end time
    const endTimeDate = new Date(endTime);
    const now = new Date();
    const timeRemaining = endTimeDate.getTime() - now.getTime();

    // If end time has already passed, show checkmark immediately
    if (timeRemaining <= 0 && !isDragged) {
      setIsCompleted(true);
      return;
    }

    // Schedule the completion animation
    const timeoutId = setTimeout(() => {
      setIsCompleted(true);
    }, timeRemaining);

    // Cleanup timeout on unmount or when dependencies change
    return () => clearTimeout(timeoutId);
  }, [completed, endTime, isCompleted, slideAnimation, isDragged]);

  useEffect(() => {
    if (isDragged) {
      setIsCompleted(false);
      return;
    }
    
    // When drag ends, check if slot should be completed
    if (!isDragged) {
      // Check if manually completed
      if (completed === true) {
        setIsCompleted(true);
        return;
      }
      
      // Check if time has passed
      if (endTime) {
        const endTimeDate = new Date(endTime);
        const now = new Date();
        if (now > endTimeDate) {
          setIsCompleted(true);
          return;
        }
      }
    }
  }, [isDragged, completed, endTime]);

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
