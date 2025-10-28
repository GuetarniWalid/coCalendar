import { View, StyleSheet, Text } from 'react-native';
import { CompletionCheckmark } from './CompletionCheckmark';
import { fontSize, fontWeight } from '@project/shared/theme/typography';
import { colors } from '@project/shared/theme/colors';
import { Image } from 'expo-image';
import { ProgressBar } from './ProgressBar';
import { TaskCounter } from './TaskCounter';
import { NoteIndicator } from './NoteIndicator';
import { VoiceIndicator } from './VoiceIndicator';
import { ParticipantsIndicator } from './ParticipantsIndicator';
import { useMemo } from 'react';
import {
  SlotItem as SlotItemType,
  SlotColorName,
  formatTime,
  getAvatarPublicUrl,
  getSlotBackgroundColor,
} from '@project/shared';
import { useTranslation } from '@project/i18n';

export const Slot = ({ slot, onImageLoad }: { slot: SlotItemType; onImageLoad?: () => void }) => {
  const t = useTranslation();
  const dynamicStyle = useMemo(
    () => ({
      backgroundColor: getSlotBackgroundColor(slot.color),
    }),
    [slot.color]
  );

  const timeText = useMemo(() => {
    if (!slot.startTime && !slot.endTime) return t.timeToDo;
    if (slot.startTime && slot.withoutTime) return t.timeToday;
    if (slot.startTime && !slot.endTime) return formatTime(slot.startTime);
    if (slot.startTime && slot.endTime)
      return `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;
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
    <View style={[styles.container, dynamicStyle]} collapsable={false}>
      <View style={styles.cardContainer}>
        <CompletionCheckmark slot={slot} />
        <View style={styles.contentContainer}>
          <Text style={styles.time}>{timeText}</Text>
          <Text style={styles.title}>
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
              <ParticipantsIndicator
                participants={slot.participants}
                slotColor={slot.color as SlotColorName}
              />
            </View>
          )}
        </View>
      </View>
      {imageUri && (
        <Image
          source={imageUri}
          style={styles.slotImage}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={0}
          pointerEvents="none"
          priority="normal"
          allowDownscaling={false}
          {...(onImageLoad && { onLoad: () => onImageLoad() })}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    // No overflow hidden here to allow image to extend outside
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 36,
    minHeight: 129,
  },
  cardContainer: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    position: 'relative',
    overflow: 'hidden', // Clip overflow for TaskChecked animation only
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
    marginBottom: 4,
    color: colors.typography.primary,
  },
});
