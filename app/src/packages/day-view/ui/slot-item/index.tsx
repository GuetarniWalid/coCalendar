import { FC, useMemo, memo, useCallback, useEffect } from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { SlotItem as SlotItemType, SlotColorName, formatTime, getAvatarPublicUrl, getSlotBackgroundColor, useTimeTrackerStore } from '@project/shared';
import { colors, spacing, fontSize, fontWeight } from '@project/shared';
import { TaskChecked } from '@project/icons';
import { Image } from 'expo-image';
import { ProgressBar } from './ProgressBar';
import { TaskCounter } from './TaskCounter';
import { NoteIndicator } from './NoteIndicator';
import { VoiceIndicator } from './VoiceIndicator';
import { ParticipantsIndicator } from './ParticipantsIndicator';
import { useTranslation } from '@project/i18n';

interface SlotItemProps {
  slot: SlotItemType;
  onPress: (slot: SlotItemType) => void;
}

const SlotItemBase: FC<SlotItemProps> = ({ slot, onPress }) => {
  const t = useTranslation();
  
  const dynamicStyle = useMemo(
    () => ({
      backgroundColor: getSlotBackgroundColor(slot.color),
    }),
    [slot.color]
  );

  const baseId = useMemo(() => (slot.id ?? 'default-slot').toString(), [slot.id]);
  const cardNativeId = useMemo(() => `slot-card-${baseId}`, [baseId]);
  const titleNativeId = useMemo(() => `slot-title-${baseId}`, [baseId]);

  const timeText = useMemo(() => {
    if (!slot.startTime && !slot.endTime) return t.timeToDo;
    if (slot.startTime && slot.withoutTime) return t.timeToday;
    if (slot.startTime && !slot.endTime) return formatTime(slot.startTime);
    if (slot.startTime && slot.endTime) return `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;
    return t.timeToDo;
  }, [slot.startTime, slot.endTime, slot.withoutTime, t]);

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
    
    // If no end time, slot can't be auto-completed based on time
    if (!slot.endTime) return false;
    
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
              <VoiceIndicator voice_path={slot.voice_path} />
            </View>
            {slot.participants && slot.participants.length > 0 && (
              <View style={styles.participantsRow}>
                <ParticipantsIndicator participants={slot.participants} slotColor={slot.color as SlotColorName} />
              </View>
            )}
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
  const prev = prevProps.slot;
  const next = nextProps.slot;
  
  // Compare essential props that affect rendering
  return (
    prev.id === next.id &&
    prev.title === next.title &&
    prev.startTime === next.startTime &&
    prev.endTime === next.endTime &&
    prev.color === next.color &&
    prev.completed === next.completed &&
    prev.description === next.description &&
    prev.voice_path === next.voice_path &&
    prev.image?.name === next.image?.name &&
    prev.tasks?.length === next.tasks?.length &&
    prev.tasks?.filter(t => t.is_done).length === next.tasks?.filter(t => t.is_done).length &&
    prev.participants?.length === next.participants?.length
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
    gap: 14,
    paddingLeft: 6,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
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
});
