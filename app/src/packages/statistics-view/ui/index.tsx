import { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Text, colors, fontSize, spacing, setCurrentScreen } from '@project/shared';

const StatisticsScreen = () => {
  // Track when this screen becomes active
  useFocusEffect(
    useCallback(() => {
      setCurrentScreen('Statistics');
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statistics</Text>
      <Text style={styles.subtitle}>Your productivity stats</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    color: colors.typography.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.typography.secondary,
  },
});

export default StatisticsScreen;
