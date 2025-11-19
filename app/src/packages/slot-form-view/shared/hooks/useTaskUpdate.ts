import { useCallback } from 'react';
import {
  useSlotFormStore,
  useAuthStore,
  useCalendarStore,
  retryWithBackoff,
  updateSlotCache,
} from '@project/shared';
import { createTask, updateTaskText, updateTaskDone, updateTaskPosition, deleteTask } from '../../data/task-operations';

export const useTaskUpdate = () => {
  const [selectedSlot, setSelectedSlot] = useSlotFormStore.selectedSlot();
  const [{ supabase, user }] = useAuthStore();
  const [selectedDate] = useCalendarStore.selectedDate();

  const createNewTask = useCallback(
    async (slotId: string, text: string, position: number, isDone: boolean = false) => {
      if (!supabase || !user || !selectedSlot) return null;

      try {
        const createdTask = await retryWithBackoff(
          () => createTask(supabase, slotId, text, position, isDone),
          3,
          1000
        );

        if (createdTask) {
          const updatedTasks = [...(selectedSlot.tasks || []), createdTask];
          const updatedSlot = { ...selectedSlot, tasks: updatedTasks };

          updateSlotCache(selectedSlot.id, selectedDate, selectedDate, updatedSlot);
          setSelectedSlot(updatedSlot);

          return createdTask;
        } else {
          console.error('Failed to create task');
          return null;
        }
      } catch (error) {
        console.error('Error creating task:', error);
        return null;
      }
    },
    [supabase, user, selectedSlot, selectedDate, setSelectedSlot]
  );

  const updateText = useCallback(
    async (taskId: string, text: string) => {
      if (!supabase || !user) return;

      try {
        await retryWithBackoff(
          () => updateTaskText(supabase, taskId, text),
          3,
          1000
        );
      } catch (error) {
        console.error('Error updating task text:', error);
      }
    },
    [supabase, user]
  );

  const updateDone = useCallback(
    async (taskId: string, isDone: boolean) => {
      if (!supabase || !user) return;

      try {
        await retryWithBackoff(
          () => updateTaskDone(supabase, taskId, isDone),
          3,
          1000
        );
      } catch (error) {
        console.error('Error updating task done status:', error);
      }
    },
    [supabase, user]
  );

  const updatePosition = useCallback(
    async (taskId: string, position: number) => {
      if (!supabase || !user) return;

      try {
        await retryWithBackoff(
          () => updateTaskPosition(supabase, taskId, position),
          3,
          1000
        );
      } catch (error) {
        console.error('Error updating task position:', error);
      }
    },
    [supabase, user]
  );

  const removeTask = useCallback(
    async (taskId: string) => {
      if (!supabase || !user || !selectedSlot) return;

      try {
        const success = await retryWithBackoff(
          () => deleteTask(supabase, taskId),
          3,
          1000
        );

        if (success) {
          const updatedTasks = (selectedSlot.tasks || []).filter((task) => task.id !== taskId);
          const updatedSlot = { ...selectedSlot, tasks: updatedTasks };

          updateSlotCache(selectedSlot.id, selectedDate, selectedDate, updatedSlot);
          setSelectedSlot(updatedSlot);
        } else {
          console.error('Failed to delete task');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    },
    [supabase, user, selectedSlot, selectedDate, setSelectedSlot]
  );

  return { createNewTask, updateText, updateDone, updatePosition, removeTask };
};
