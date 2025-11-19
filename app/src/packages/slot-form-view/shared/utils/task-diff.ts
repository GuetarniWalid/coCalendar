import { SlotTask } from '@project/shared';

export interface TaskDiff {
  created: SlotTask[];
  updated: Array<{
    task: SlotTask;
    changes: {
      text?: boolean;
      is_done?: boolean;
      position?: boolean;
    };
  }>;
  deleted: SlotTask[];
}

export const computeTaskDiff = (
  originalTasks: SlotTask[],
  currentTasks: SlotTask[]
): TaskDiff => {
  const created: SlotTask[] = [];
  const updated: TaskDiff['updated'] = [];
  const deleted: SlotTask[] = [];

  const currentTasksMap = new Map(currentTasks.map(t => [t.id, t]));
  const originalTasksMap = new Map(originalTasks.map(t => [t.id, t]));

  for (const currentTask of currentTasks) {
    const originalTask = originalTasksMap.get(currentTask.id);

    if (!originalTask) {
      created.push(currentTask);
    } else {
      const changes: TaskDiff['updated'][0]['changes'] = {};
      let hasChanges = false;

      if (currentTask.text !== originalTask.text) {
        changes.text = true;
        hasChanges = true;
      }

      if (currentTask.is_done !== originalTask.is_done) {
        changes.is_done = true;
        hasChanges = true;
      }

      if (currentTask.position !== originalTask.position) {
        changes.position = true;
        hasChanges = true;
      }

      if (hasChanges) {
        updated.push({ task: currentTask, changes });
      }
    }
  }

  for (const originalTask of originalTasks) {
    if (!currentTasksMap.has(originalTask.id)) {
      deleted.push(originalTask);
    }
  }

  return { created, updated, deleted };
};

export const hasPendingChanges = (diff: TaskDiff): boolean => {
  return diff.created.length > 0 || diff.updated.length > 0 || diff.deleted.length > 0;
};
