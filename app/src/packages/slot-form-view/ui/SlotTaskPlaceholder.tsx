import { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fontSize, spacing, colors } from '@project/shared';

interface SlotTaskPlaceholderProps {
  text: string;
}

export const SlotTaskPlaceholder: FC<SlotTaskPlaceholderProps> = ({ text }) => {
  return (
    <View style={styles.container}>
      <View style={styles.radioCircle} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.typography.secondary,
    marginRight: spacing.md,
  },
  text: {
    fontSize: fontSize.base,
    color: colors.typography.secondary,
  },
});
