import { FC } from 'react';
import { StyleSheet } from 'react-native';
import { Text, fontSize, colors } from '@project/shared';

interface SlotMessagePlaceholderProps {
  text: string;
}

export const SlotMessagePlaceholder: FC<SlotMessagePlaceholderProps> = ({
  text,
}) => {
  return <Text style={styles.text}>{text}</Text>;
};

const styles = StyleSheet.create({
  text: {
    fontSize: fontSize.base,
    color: colors.typography.secondary,
    paddingLeft: 6,
  },
});
