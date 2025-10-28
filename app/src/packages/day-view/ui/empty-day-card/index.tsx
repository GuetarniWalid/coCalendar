import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  getAvatarPublicUrl,
} from '@project/shared';
import { Image } from 'expo-image';
import { useTranslation } from '@project/i18n';
import { useDraggedSlotContext } from '@project/shared/store/dragged-slot';

const EmptyDayCardBase = () => {
  const t = useTranslation();
  const { draggedSlot } = useDraggedSlotContext();
  const uri = getAvatarPublicUrl({
    persona: 'adult-female',
    activity: 'health_wellbeing',
    name: 'rest',
    extension: 'webp',
  });

  if (draggedSlot) {
    return null;
  }

  return (
    <View style={styles.container}>
      {!!uri && (
        <Image
          source={uri}
          style={styles.bgImage}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={0}
          pointerEvents="none"
          recyclingKey="rest-avatar"
          priority="high"
          allowDownscaling={false}
          key="stable-avatar-image"
          blurRadius={0}
        />
      )}
      <View style={styles.content}>
        <Text style={styles.text}>{t.emptyDayText}</Text>
        <Text style={styles.title}>{t.emptyDayTitle}</Text>
      </View>
    </View>
  );
};

export const EmptyDayCard = memo(EmptyDayCardBase, () => {
  // Never re-render - the component is completely stable
  return true;
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxxl,
    borderRadius: 36,
    minHeight: 129,
    backgroundColor:
      colors.background.slot.default?.default || colors.background.secondary,
  },
  content: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.typography.primary,
  },
  text: {
    fontSize: fontSize.base,
    color: colors.typography.primary,
  },
  bgImage: {
    position: 'absolute',
    top: -30,
    right: 15,
    width: 150,
    height: 150,
  } as const,
});
