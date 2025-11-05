import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import {
  fontWeight,
  colors,
  SlotColorName,
  getSlotBackgroundColor,
} from '@project/shared';

interface TimeCircleProps {
  time: string;
  slotColor?: SlotColorName | undefined;
  onPress?: () => void;
  style?: ViewStyle;
}

const TimeCircleContent = ({ time }: { time: string }) => {
  const hasAmPm = /\s?(AM|PM|am|pm)$/i.test(time);

  if (hasAmPm) {
    const match = time.match(/^(.+?)\s?(AM|PM|am|pm)$/i);
    if (match) {
      const [, timeValue = '', period = ''] = match;
      return (
        <View style={styles.timeWithPeriodContainer}>
          <Text style={styles.timeText}>{timeValue}</Text>
          <Text style={styles.periodText}>{period.toUpperCase()}</Text>
        </View>
      );
    }
  }

  return <Text style={styles.timeText}>{time}</Text>;
};

export const TimeCircle = ({
  time,
  slotColor,
  onPress,
  style,
}: TimeCircleProps) => {
  const backgroundColor = getSlotBackgroundColor(slotColor);

  const circleContent = (
    <View
      style={[
        styles.timeCircle,
        {
          backgroundColor,
        },
        style,
      ]}
    >
      <View style={styles.overlay} />
      <TimeCircleContent time={time} />
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{circleContent}</Pressable>;
  }

  return circleContent;
};

const styles = StyleSheet.create({
  timeCircle: {
    width: 90,
    height: 90,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 999,
  },
  timeWithPeriodContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: fontWeight.bold,
    color: colors.typography.primary,
  },
  periodText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.typography.primary,
  },
});
