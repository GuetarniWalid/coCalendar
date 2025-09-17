import { FC, useMemo, memo, useCallback } from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { SlotItem as SlotItemType, formatTime } from '@project/shared';
import { colors, spacing, fontSize, fontWeight } from '@project/shared';

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

  const handlePress = useCallback(() => {
    onPress(slot);
  }, [onPress, slot]);

  return (
    <TouchableOpacity style={[styles.container, dynamicStyle]} onPress={handlePress}>
      <View nativeID={cardNativeId}>
        <Text style={styles.time}>{timeText}</Text>
        <Text nativeID={titleNativeId} style={styles.title}>
          {slot.title}
        </Text>
        {slot.clientName && <Text style={styles.clientName}>Client: {slot.clientName}</Text>}
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
    prevProps.onPress === nextProps.onPress
  );
});

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
