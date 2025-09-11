import { FC, useMemo } from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { SlotItem as SlotItemType, formatTime } from '@project/shared';
import { colors, spacing, fontSize, fontWeight } from '@project/shared';

interface SlotItemProps {
  slot: SlotItemType;
  onPress: (slot: SlotItemType) => void;
}

export const SlotItem: FC<SlotItemProps> = ({ slot, onPress }) => {
  const dynamicStyle = slot.color
    ? { backgroundColor: slot.color }
    : { backgroundColor: colors.background.secondary };

  const baseId = useMemo(() => (slot.id ?? 'default-slot').toString(), [slot.id]);
  const cardNativeId = useMemo(() => `slot-card-${baseId}`, [baseId]);
  const titleNativeId = useMemo(() => `slot-title-${baseId}`, [baseId]);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        dynamicStyle,
      ]}
      onPress={() => onPress(slot)}
    > 
      <View nativeID={cardNativeId}>
        <Text style={[styles.time]}>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</Text>
        <Text nativeID={titleNativeId} style={[styles.title]}>{slot.title}</Text>
        {slot.clientName && (
          <Text style={styles.clientName}>Client: {slot.clientName}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxxl,
    borderRadius: 36,
    minHeight: 129,
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
