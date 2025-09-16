import { FC, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fontSize, fontWeight } from '@project/shared';
import Svg, { Circle } from 'react-native-svg';
import Rive from 'rive-react-native';

interface DayTasksProgressProps {
  progressPercentage: number;
}

export const DayTasksProgress: FC<DayTasksProgressProps> = ({ progressPercentage }) => {
  const progress = Math.max(0, Math.min(100, progressPercentage));
  const [showRiveTest, setShowRiveTest] = useState(false);

  const size = 60;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  if (showRiveTest) {
    return (
      <View style={styles.riveTestContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setShowRiveTest(false)}
        >
          <Text style={styles.backButtonText}>← Back to Progress</Text>
        </TouchableOpacity>
        <Text style={styles.riveTitle}>Rive Animation Test</Text>
        <View style={styles.riveAnimationContainer}>
          <Rive
            url="https://cdn.rive.app/animations/vehicles.riv"
            style={styles.riveAnimation}
            autoplay={true}
          />
        </View>
        <Text style={styles.riveSubtitle}>
          If you see an animation above, Rive is working correctly!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.progressContainer}
        onPress={() => setShowRiveTest(true)}
      >
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
      </TouchableOpacity>
      <Text style={styles.tapHint}>Tap to test Rive</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
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
  tapHint: {
    fontSize: fontSize.xs,
    color: colors.typography.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  riveTestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background.primary,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  riveTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: 20,
    textAlign: 'center',
    color: colors.typography.primary,
  },
  riveAnimationContainer: {
    width: 200,
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  riveAnimation: {
    width: '100%',
    height: '100%',
  },
  riveSubtitle: {
    fontSize: fontSize.base,
    textAlign: 'center',
    marginHorizontal: 20,
    color: colors.typography.secondary,
  },
});


