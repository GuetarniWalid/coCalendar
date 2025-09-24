import { FC, useMemo, memo, useCallback, useEffect, useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { SlotItem as SlotItemType, formatTime } from '@project/shared';
import { colors, spacing, fontSize, fontWeight } from '@project/shared';
import { TaskChecked } from '@project/icons';

interface SlotItemProps {
  slot: SlotItemType;
  onPress: (slot: SlotItemType) => void;
}

const SlotItemBase: FC<SlotItemProps> = ({ slot, onPress }) => {
  const dynamicStyle = useMemo(
    () => ({
      backgroundColor: slot.color || colors.background.secondary,
    }),
    [slot.color]
  );

  const baseId = useMemo(() => (slot.id ?? 'default-slot').toString(), [slot.id]);
  const cardNativeId = useMemo(() => `slot-card-${baseId}`, [baseId]);
  const titleNativeId = useMemo(() => `slot-title-${baseId}`, [baseId]);

  const timeText = useMemo(() => `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`, [slot.startTime, slot.endTime]);

  // Real-time tracking for slot completion
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Check if slot should show as completed
  const isCompleted = useMemo(() => {
    if (slot.completed) return true;
    
    // Check if current time is after end time
    const endTime = new Date(slot.endTime);
    return currentTime > endTime;
  }, [slot.completed, slot.endTime, currentTime]);

  // Update current time dynamically to track slot completion
  useEffect(() => {
    const endTime = new Date(slot.endTime);
    const now = new Date();
    
    // If slot hasn't ended yet, set a timeout for when it should end
    if (now < endTime && !slot.completed) {
      const timeUntilEnd = endTime.getTime() - now.getTime();
      
      const timeout = setTimeout(() => {
        setCurrentTime(new Date());
      }, timeUntilEnd);

      return () => clearTimeout(timeout);
    }
    
    // For slots that have already ended or are completed, update immediately
    if (now >= endTime || slot.completed) {
      setCurrentTime(now);
    }
    
    return undefined;
  }, [slot.endTime, slot.completed]);

  // Animation for TaskChecked slide-in
  const slideAnimation = useSharedValue(isCompleted ? 0 : -100);

  useEffect(() => {
    slideAnimation.value = withTiming(isCompleted ? 0 : -100, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, [isCompleted, slideAnimation]);

  const animatedCheckmarkStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: `${slideAnimation.value}%` }],
    };
  });

  const handlePress = useCallback(() => {
    onPress(slot);
  }, [onPress, slot]);

  return (
    <TouchableOpacity style={[styles.container, dynamicStyle]} onPress={handlePress}>
      <View style={styles.cardContainer} nativeID={cardNativeId}>
        {isCompleted && (
          <Animated.View style={[styles.checkmarkContainer, animatedCheckmarkStyle]}>
            <TaskChecked height={60} color={colors.success} />
          </Animated.View>
        )}
        <View style={styles.contentContainer}>
          <Text style={styles.time}>{timeText}</Text>
          <Text nativeID={titleNativeId} style={styles.title}>
            {slot.title}
          </Text>
          {slot.clientName && <Text style={styles.clientName}>Client: {slot.clientName}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const SlotItem = memo(SlotItemBase, (prevProps, nextProps) => {
  return (
    prevProps.slot.id === nextProps.slot.id &&
    prevProps.slot.title === nextProps.slot.title &&
    prevProps.slot.startTime === nextProps.slot.startTime &&
    prevProps.slot.endTime === nextProps.slot.endTime &&
    prevProps.slot.color === nextProps.slot.color &&
    prevProps.slot.clientName === nextProps.slot.clientName &&
    prevProps.slot.completed === nextProps.slot.completed &&
    prevProps.onPress === nextProps.onPress
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: 36,
    minHeight: 129,
    // No clipping on the main container to allow future image overflow
  },
  cardContainer: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxxl,
    borderRadius: 36,
    position: 'relative',
    overflow: 'hidden', // Clip overflow for TaskChecked animation
    flex: 1,
  },
  contentContainer: {
    // Container for text content
  },
  checkmarkContainer: {
    position: 'absolute',
    left: -0.01,
    top: 38,
    zIndex: 1,
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.typography.primary,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
    color: colors.typography.primary,
  },
  clientName: {
    fontSize: fontSize.sm,
    color: colors.typography.secondary,
    fontStyle: 'italic',
  },
});
