import { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Text, colors, fontSize, spacing, setCurrentScreen } from '@project/shared';

const TasksScreen = () => {
  // Track when this screen becomes active
  useFocusEffect(
    useCallback(() => {
      setCurrentScreen('Tasks');
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tasks</Text>
      <Text style={styles.subtitle}>Manage your tasks</Text>
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

export default TasksScreen;
