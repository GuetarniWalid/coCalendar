import { FC, useState, useEffect, useCallback, useRef } from 'react';
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
  slotDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return slotDate < today;
};

const calculateCompletion = (slotData: SlotItem): boolean => {
  if (slotData.completionStatus === 'incomplete') {
    return false;
  }
  if (slotData.completionStatus === 'completed') {
    return true;
  }

  if (!slotData.endTime) {
    return isDayPassed(slotData.startTime);
  }

  const endTimeDate = new Date(slotData.endTime);
  const now = new Date();
  return now > endTimeDate;
};

export const CompletionCheckmark: FC<CompletionCheckmarkProps> = ({ slot }) => {
  const { draggedSlot } = useDraggedSlotContext();
  const isDragged = draggedSlot?.id === slot.id;
  const prevIsDraggedRef = useRef(isDragged);

  const [isCompleted, setIsCompleted] = useState<boolean>(() =>
    calculateCompletion(slot)
  );
  const [shouldRender, setShouldRender] = useState<boolean>(isCompleted);

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
    const wasDragged = prevIsDraggedRef.current;
    prevIsDraggedRef.current = isDragged;

    if (isDragged) {
      if (isCompleted) setIsCompleted(false);
      return undefined;
    }

    const justFinishedDrag = wasDragged && !isDragged;
    if (justFinishedDrag) {
      const shouldBeCompleted = calculateCompletion(slot);
      if (shouldBeCompleted !== isCompleted) {
        setIsCompleted(shouldBeCompleted);
      }
      return undefined;
    }

    const shouldBeCompleted = calculateCompletion(slot);
    if (shouldBeCompleted !== isCompleted) {
      setIsCompleted(shouldBeCompleted);
    }

    if (slot.completionStatus === 'auto' && slot.endTime && !isCompleted) {
      const endTimeDate = new Date(slot.endTime);
      const now = new Date();
      const timeRemaining = endTimeDate.getTime() - now.getTime();

      if (timeRemaining > 0) {
        const timeoutId = setTimeout(() => {
          setIsCompleted(true);
        }, timeRemaining);

        return () => clearTimeout(timeoutId);
      }
    }

    return undefined;
  }, [slot, isDragged, isCompleted]);

  useEffect(() => {
    if (isCompleted) animateCompletion();
    else animateUncompletion();
  }, [isCompleted, animateCompletion, animateUncompletion]);

  const animatedCheckmarkStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: `${slideAnimation.value}%` }],
    };
  });

  if (!shouldRender || slot.completionStatus === 'incomplete' || isDragged) {
    return null;
  }

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
