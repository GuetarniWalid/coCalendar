import { Text, StyleSheet } from 'react-native';
import { colors, fontSize } from '@project/shared';

type SlotFormTimeProps = {
  startTime: string;
  endTime: string;
};

export const SlotFormTime = ({ startTime, endTime }: SlotFormTimeProps) => {
  return <Text style={styles.timeText}>{startTime} - {endTime}</Text>;
};

const styles = StyleSheet.create({
  timeText: {
    fontSize: fontSize.xs,
    color: colors.typography.primary,
  },
});


