import { FC, useMemo, memo } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { SlotItem as SlotItemType, SlotColorName, formatTime, getAvatarPublicUrl, getSlotBackgroundColor } from '@project/shared';
import { colors, spacing, fontSize, fontWeight } from '@project/shared';
import { Image } from 'expo-image';
import { ProgressBar } from './ProgressBar';
import { TaskCounter } from './TaskCounter';
import { NoteIndicator } from './NoteIndicator';
import { VoiceIndicator } from './VoiceIndicator';
import { ParticipantsIndicator } from './ParticipantsIndicator';
import { CompletionCheckmark } from './CompletionCheckmark';
import { useTranslation } from '@project/i18n';
import { DraggableSlotWrapper } from './DraggableSlotWrapper';

interface SlotItemProps {
  slot: SlotItemType;
  index: number;
  onPress: (slot: SlotItemType) => void;
  selectedDate: string;
}

const SlotItemBase: FC<SlotItemProps> = ({ slot, index, onPress, selectedDate }) => {
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
      extension: 'webp' as const,
    };

    const uri = getAvatarPublicUrl({
      persona: imageConfig.persona,
      activity: imageConfig.activity,
      name: imageConfig.name,
      extension: imageConfig.extension,
    });

    return uri;
  }, [slot.image]);

  return (
    <DraggableSlotWrapper onPress={() => onPress(slot)} index={index} selectedDate={selectedDate}>
      <View style={[styles.container, dynamicStyle]}>
        <View style={styles.cardContainer} nativeID={cardNativeId}>
          <CompletionCheckmark completed={slot.completed} endTime={slot.endTime} index={index} />
          <View style={styles.contentContainer}>
            <Text style={styles.time}>{timeText}</Text>
            <Text nativeID={titleNativeId} style={styles.title}>
              {slot.title}
            </Text>
            <ProgressBar startTime={slot.startTime} endTime={slot.endTime} slotColor={slot.color} />
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
        {imageUri && <Image source={imageUri} style={styles.slotImage} contentFit='contain' cachePolicy='memory-disk' transition={0} pointerEvents='none' priority='normal' allowDownscaling={false} />}
      </View>
    </DraggableSlotWrapper>
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
    prev.participants?.length === next.participants?.length &&
    prevProps.selectedDate === nextProps.selectedDate &&
    prevProps.onPress === nextProps.onPress
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    // No overflow hidden here to allow image to extend outside
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: 36,
    minHeight: 129,
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
