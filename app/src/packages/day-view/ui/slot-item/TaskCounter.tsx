import { FC, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, SlotTask, colors, fontSize } from '@project/shared';
import { ToDoList } from '@project/icons';

interface TaskCounterProps {
  tasks: SlotTask[] | undefined;
}

export const TaskCounter: FC<TaskCounterProps> = ({ tasks }) => {
  const { completedCount, totalCount } = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return { completedCount: 0, totalCount: 0 };
    }

    const completed = tasks.filter(task => task.is_done).length;
    return { completedCount: completed, totalCount: tasks.length };
  }, [tasks]);

  // Don't render if no tasks
  if (!tasks || tasks.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ToDoList size={23} color={colors.typography.primary} />
      <Text style={styles.counter}>
        {completedCount}/{totalCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  counter: {
    fontSize: fontSize.lg,
    color: colors.typography.primary,
    marginLeft: 2,
    paddingBottom: 2,
  },
});
