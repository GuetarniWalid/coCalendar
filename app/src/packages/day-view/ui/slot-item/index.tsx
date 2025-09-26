import { FC, useMemo, memo, useCallback, useEffect } from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { SlotItem as SlotItemType, formatTime, getAvatarPublicUrl, getSlotBackgroundColor, useTimeTrackerStore } from '@project/shared';
import { colors, spacing, fontSize, fontWeight } from '@project/shared';
import { TaskChecked } from '@project/icons';
import { Image } from 'expo-image';
import { ProgressBar } from './ProgressBar';
import { TaskCounter } from './TaskCounter';
import { NoteIndicator } from './NoteIndicator';

interface SlotItemProps {
  slot: SlotItemType;
  onPress: (slot: SlotItemType) => void;
}

const SlotItemBase: FC<SlotItemProps> = ({ slot, onPress }) => {
  const dynamicStyle = useMemo(
    () => ({
      backgroundColor: getSlotBackgroundColor(slot.color),
    }),
    [slot.color]
  );

  const baseId = useMemo(() => (slot.id ?? 'default-slot').toString(), [slot.id]);
  const cardNativeId = useMemo(() => `slot-card-${baseId}`, [baseId]);
  const titleNativeId = useMemo(() => `slot-title-${baseId}`, [baseId]);

  const timeText = useMemo(() => `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`, [slot.startTime, slot.endTime]);

  // Generate image URI - use slot image if provided, otherwise default
  const imageUri = useMemo(() => {
    const imageConfig = slot.image || {
      persona: 'adult-female' as const,
      activity: 'job_study',
      name: 'working_desktop',
      extension: 'webp' as const
    };
    
    const uri = getAvatarPublicUrl({
      persona: imageConfig.persona,
      activity: imageConfig.activity,
      name: imageConfig.name,
      extension: imageConfig.extension
    });
    
    return uri;
  }, [slot.image]);

  // Use Teaful time tracker for real-time completion tracking
  const [currentTime] = useTimeTrackerStore.currentTime();
  
  // Check if slot should show as completed using Teaful real-time tracking
  const isCompleted = useMemo(() => {
    if (slot.completed) return true;
    
    // Check if current time is after end time using Teaful's real-time current time
    const endTime = new Date(slot.endTime);
    const now = new Date(currentTime);
    return now > endTime;
  }, [slot.completed, slot.endTime, currentTime]);

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
      <View style={styles.slotWrapper}>
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
            <ProgressBar 
              startTime={slot.startTime} 
              endTime={slot.endTime} 
              slotColor={slot.color}
            />
            <View style={styles.indicatorsRow}>
              <TaskCounter tasks={slot.tasks ?? undefined} />
              <NoteIndicator description={slot.description} />
            </View>
            {slot.clientName && <Text style={styles.clientName}>Client: {slot.clientName}</Text>}
          </View>
        </View>
        {imageUri && (
          <Image 
            source={imageUri} 
            style={styles.slotImage} 
            contentFit='contain' 
            cachePolicy='memory-disk' 
            transition={0} 
            pointerEvents='none' 
            priority='normal'
            allowDownscaling={false}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

export const SlotItem = memo(SlotItemBase, (prevProps, nextProps) => {
  // Simplified comparison - most critical props for performance
  return (
    prevProps.slot.id === nextProps.slot.id &&
    prevProps.slot.title === nextProps.slot.title &&
    prevProps.slot.startTime === nextProps.slot.startTime &&
    prevProps.slot.endTime === nextProps.slot.endTime &&
    prevProps.slot.color === nextProps.slot.color &&
    prevProps.slot.clientName === nextProps.slot.clientName &&
    prevProps.slot.completed === nextProps.slot.completed &&
    prevProps.slot.description === nextProps.slot.description &&
    // Simple image comparison instead of expensive JSON.stringify
    prevProps.slot.image?.name === nextProps.slot.image?.name &&
    prevProps.slot.image?.persona === nextProps.slot.image?.persona &&
    // Compare tasks array length and completion status
    prevProps.slot.tasks?.length === nextProps.slot.tasks?.length &&
    prevProps.slot.tasks?.filter(t => t.is_done).length === nextProps.slot.tasks?.filter(t => t.is_done).length &&
    prevProps.onPress === nextProps.onPress
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: 36,
    minHeight: 129,
  },
  slotWrapper: {
    position: 'relative',
    // No overflow hidden here to allow image to extend outside
    flex: 1,
  },
  cardContainer: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxxl,
    borderRadius: 36,
    position: 'relative',
    overflow: 'hidden', // Clip overflow for TaskChecked animation only
    flex: 1,
  },
  contentContainer: {
    // Container for text content - limit width to 3/5 to not go under image
    width: '60%',
  },
  indicatorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  slotImage: {
    position: 'absolute',
    top: -30,
    right: 15,
    width: 150,
    height: 150,
    zIndex: 2,
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
