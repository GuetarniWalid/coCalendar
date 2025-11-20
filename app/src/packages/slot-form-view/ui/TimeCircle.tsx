import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import {
  Text,
  useThemeStore,
  SlotColorName,
  getSlotBackgroundColor,
} from '@project/shared';

interface TimeCircleProps {
  time: string;
  slotColor?: SlotColorName | undefined;
  onPress?: () => void;
  style?: ViewStyle;
}

const TimeCircleContent = ({ time, textColor }: { time: string; textColor: string }) => {
  const hasAmPm = /\s?(AM|PM|am|pm)$/i.test(time);

  if (hasAmPm) {
    const match = time.match(/^(.+?)\s?(AM|PM|am|pm)$/i);
    if (match) {
      const [, timeValue = '', period = ''] = match;
      return (
        <View style={styles.timeWithPeriodContainer}>
          <Text style={[styles.timeText, { color: textColor }]} fontWeight="bold">{timeValue}</Text>
          <Text style={[styles.periodText, { color: textColor }]} fontWeight="bold">{period.toUpperCase()}</Text>
        </View>
      );
    }
  }

  return <Text style={[styles.timeText, { color: textColor }]} fontWeight="bold">{time}</Text>;
};

export const TimeCircle = ({
  time,
  slotColor,
  onPress,
  style,
}: TimeCircleProps) => {
  const [{ colors }] = useThemeStore();
  const backgroundColor = getSlotBackgroundColor(slotColor);

  const circleContent = (
    <View
      style={[
        styles.timeCircle,
        {
          borderColor: backgroundColor,
          backgroundColor: colors.background.primary,
        },
        style,
      ]}
    >
      <View style={styles.overlay} />
      <TimeCircleContent time={time} textColor={colors.typography.primary} />
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
    borderWidth: 4,
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
  },
  periodText: {
    fontSize: 10,
  },
});
