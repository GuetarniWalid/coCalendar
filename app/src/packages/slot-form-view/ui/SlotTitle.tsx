import { FC } from 'react';
import { Text, StyleSheet } from 'react-native';
import { fontSize, fontWeight, colors } from '@project/shared';

interface SlotTitleProps {
  title: string;
}

export const SlotTitle: FC<SlotTitleProps> = ({ title }) => {
  return <Text style={styles.title}>{title}</Text>;
};

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.typography.primary,
    marginBottom: 20,
  },
});
