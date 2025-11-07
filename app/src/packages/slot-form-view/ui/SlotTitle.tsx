import { FC } from 'react';
import { StyleSheet } from 'react-native';
import { Text, fontSize, colors } from '@project/shared';

interface SlotTitleProps {
  title: string;
}

export const SlotTitle: FC<SlotTitleProps> = ({ title }) => {
  return <Text style={styles.title} fontWeight="bold">{title}</Text>;
};

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize['2xl'],
    color: colors.typography.primary,
    marginBottom: 20,
  },
});
