import { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight } from '@project/shared';
import Svg, { Circle } from 'react-native-svg';

interface DayTasksProgressProps {
  progressPercentage: number;
}

export const DayTasksProgress: FC<DayTasksProgressProps> = ({ progressPercentage }) => {
  const progress = Math.max(0, Math.min(100, progressPercentage));

  const size = 60;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={styles.progressCircle}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.background.tertiary}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={styles.percentageText}>{progress}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  progressCircle: {
    position: 'absolute',
  },
  percentageText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.typography.primary,
  },
});


