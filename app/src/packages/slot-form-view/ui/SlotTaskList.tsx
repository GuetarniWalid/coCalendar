import {
  useRef,
  useCallback,
  RefObject,
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from 'react';
import { View, TextInput, AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  useSlotFormStore,
  useAuthStore,
  useCalendarStore,
  updateSlotCache,
  retryWithBackoff,
} from '@project/shared';
import { SlotTask, SlotTaskRef } from './SlotTask';
import { SlotTask as SlotTaskType } from '@project/shared';
import {
  computeTaskDiff,
  TaskDiff,
  hasPendingChanges,
} from '../shared/utils/task-diff';
import {
  savePendingChanges,
  clearPendingChanges,
} from '../shared/utils/task-persistence';
import {
  createTask,
  updateTaskText,
  updateTaskDone,
  updateTaskPosition,
  deleteTask,
} from '../data/task-operations';

interface SlotTaskListProps {
  scrollToY: (y: any) => void;
  messageInputRef: RefObject<TextInput | null>;
}

export interface SlotTaskListRef {
  getTaskDiff: () => TaskDiff;
  getTasks: () => SlotTaskType[];
  syncTasks: () => Promise<void>;
}

export const SlotTaskList = forwardRef<SlotTaskListRef, SlotTaskListProps>(
  ({ scrollToY, messageInputRef }, ref) => {
    const [selectedSlot, setSelectedSlot] = useSlotFormStore.selectedSlot();
    const [selectedDate] = useCalendarStore.selectedDate();
    const [{ supabase }] = useAuthStore();

    const [tasks, setTasks] = useState(() => {
      const initialTasks = (selectedSlot?.tasks || []).sort(
        (a, b) => a.position - b.position
      );
      return initialTasks;
    });
    const [newlyCreatedTaskId, setNewlyCreatedTaskId] = useState<string | null>(
      null
    );
    const originalTasksRef = useRef<SlotTaskType[]>(selectedSlot?.tasks || []);
    const taskRefsMap = useRef(new Map<string, SlotTaskRef>());
    const syncTasksRef = useRef<() => Promise<void>>(null);
    const syncDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isSyncingRef = useRef(false);

    const syncTasks = async () => {
      if (!selectedSlot || !supabase || isSyncingRef.current) {
        return;
      }

      isSyncingRef.current = true;

      try {
        const diff = computeTaskDiff(originalTasksRef.current, tasks);

        if (!hasPendingChanges(diff)) {
          isSyncingRef.current = false;
          return;
         }

        const optimisticSlot = { ...selectedSlot, tasks };
        updateSlotCache(selectedSlot.id, selectedDate, selectedDate, optimisticSlot);
        setSelectedSlot(optimisticSlot);

        await Promise.all([
          ...diff.deleted
            .filter(task => !task.id.startsWith('new-task-'))
            .map(task =>
              retryWithBackoff(() => deleteTask(supabase, task.id), 3, 1000)
            ),

          ...diff.updated
            .filter(({ task }) => !task.id.startsWith('new-task-'))
            .flatMap(({ task, changes }) => {
              const operations = [];
              if (changes.text) {
                operations.push(
                  retryWithBackoff(
                    () => updateTaskText(supabase, task.id, task.text),
                    3,
                    1000
                  )
                );
              }
              if (changes.is_done !== undefined) {
                operations.push(
                  retryWithBackoff(
                    () => updateTaskDone(supabase, task.id, task.is_done),
                    3,
                    1000
                  )
                );
              }
              if (changes.position !== undefined) {
                operations.push(
                  retryWithBackoff(
                    () => updateTaskPosition(supabase, task.id, task.position),
                    3,
                    1000
                  )
                );
              }
              return operations;
            }),
        ]);

        const createdTasksMap = new Map<string, SlotTaskType>();
        const createdResults = await Promise.all(
          diff.created.map(task =>
            retryWithBackoff(
              () =>
                createTask(
                  supabase,
                  selectedSlot.id,
                  task.text,
                  task.position,
                  task.is_done
                ),
              3,
              1000
            )
          )
        );

        diff.created.forEach((task, index) => {
          const createdTask = createdResults[index];
          if (createdTask) {
            createdTasksMap.set(task.id, createdTask);
          }
        });

        let finalTasks = tasks;

        if (createdTasksMap.size > 0) {
          finalTasks = tasks.map(task =>
            createdTasksMap.has(task.id) ? createdTasksMap.get(task.id)! : task
          );
          setTasks(finalTasks);
        }

        const finalSlot = { ...selectedSlot, tasks: finalTasks };
        updateSlotCache(selectedSlot.id, selectedDate, selectedDate, finalSlot);
        setSelectedSlot(finalSlot);
        originalTasksRef.current = finalTasks;

        if (selectedSlot.id) {
          await clearPendingChanges(selectedSlot.id);
        }
      } catch (error) {
        console.error('Error syncing tasks to database:', error);
        if (selectedSlot.id) {
          const diff = computeTaskDiff(originalTasksRef.current, tasks);
          if (diff) {
            await savePendingChanges(selectedSlot.id, diff);
          }
        }
      } finally {
        isSyncingRef.current = false;
      }
    };

    const debouncedSync = () => {
      if (syncDebounceTimerRef.current) {
        clearTimeout(syncDebounceTimerRef.current);
      }
      syncDebounceTimerRef.current = setTimeout(() => {
        syncTasksRef.current?.();
      }, 100);
    };

    syncTasksRef.current = syncTasks;

    useImperativeHandle(ref, () => ({
      getTaskDiff: () => computeTaskDiff(originalTasksRef.current, tasks),
      getTasks: () => tasks,
      syncTasks,
    }));

    useFocusEffect(
      useCallback(() => {
        if (selectedSlot?.tasks) {
          const sortedSlotTasks = [...selectedSlot.tasks].sort(
            (a, b) => a.position - b.position
          );

          setTasks(currentTasks => {
            const currentHash = currentTasks
              .map(t => `${t.id}:${t.text}:${t.is_done}:${t.position}`)
              .join('|');
            const slotHash = sortedSlotTasks
              .map(t => `${t.id}:${t.text}:${t.is_done}:${t.position}`)
              .join('|');

            if (currentHash !== slotHash) {
              originalTasksRef.current = sortedSlotTasks;
              return sortedSlotTasks;
            }
            return currentTasks;
          });
        }

        return () => {
          syncTasksRef.current?.();
        };
      }, [selectedSlot?.tasks])
    );

    useEffect(() => {
      const subscription = AppState.addEventListener('change', nextState => {
        if (nextState === 'background' || nextState === 'inactive') {
          debouncedSync();
        }
      });

      return () => {
        if (syncDebounceTimerRef.current) {
          clearTimeout(syncDebounceTimerRef.current);
        }
        subscription.remove();
      };
    }, []);

    useEffect(() => {
      if (newlyCreatedTaskId) {
        const timer = setTimeout(() => {
          setNewlyCreatedTaskId(null);
        }, 100);
        return () => clearTimeout(timer);
      }
      return undefined;
    }, [newlyCreatedTaskId]);

    const setTaskRef = useCallback(
      (taskId: string, ref: SlotTaskRef | null) => {
        if (ref) {
          taskRefsMap.current.set(taskId, ref);
        } else {
          taskRefsMap.current.delete(taskId);
        }
      },
      []
    );

    const handleRemoveTask = useCallback(
      (task: SlotTaskType) => {
        const newTasks = tasks.filter(t => t.id !== task.id);
        setTasks(newTasks);
      },
      [tasks]
    );

    const focusOtherTask = useCallback(
      (task: SlotTaskType, direction: 'next' | 'previous') => {
        const taskIndex = tasks.findIndex(t => t.id === task.id);
        const nextTask =
          direction === 'next' ? tasks[taskIndex + 1] : tasks[taskIndex - 1];

        if (!nextTask) return;
        const nextRef = taskRefsMap.current.get(nextTask.id);
        nextRef?.focus();
      },
      [tasks]
    );

    const handleAddTask = useCallback(
      (task: SlotTaskType) => {
        const newTaskPosition = task.position + 1;

        const updatedTasks = tasks.map(t =>
          t.position >= newTaskPosition ? { ...t, position: t.position + 1 } : t
        );

        // for a new task
        if (!updatedTasks.length) {
          updatedTasks.push(task);
        }

        const newTask: SlotTaskType = {
          id: `new-task-${Date.now()}`,
          text: '',
          is_done: false,
          position: newTaskPosition,
        };

        const allTasks = [...updatedTasks, newTask].sort(
          (a, b) => a.position - b.position
        );
        setTasks(allTasks);
        setNewlyCreatedTaskId(newTask.id);
      },
      [tasks]
    );

    const handleTaskCreated = useCallback(
      (tempId: string, createdTask: SlotTaskType) => {
        setTasks(currentTasks => {
          return currentTasks.map(t => (t.id === tempId ? createdTask : t));
        });
      },
      []
    );

    const handleTaskUpdated = useCallback(
      (taskId: string, updates: Partial<SlotTaskType>) => {
        setTasks(currentTasks => {
          const updatedTasks = currentTasks.map(t =>
            t.id === taskId ? { ...t, ...updates } : t
          );
          return updatedTasks;
        });
      },
      []
    );

    return (
      <View>
        {tasks.length > 0 ? (
          tasks.map((task, index) => {
            const nextTask = tasks.find(t => t.position === task.position + 1);
            const isNextTaskEmpty = nextTask
              ? nextTask.text.trim() === ''
              : false;

            return (
              <SlotTask
                key={task.id}
                ref={ref => setTaskRef(task.id, ref)}
                task={task}
                slot={selectedSlot!}
                handleAddTask={handleAddTask}
                handleRemoveTask={handleRemoveTask}
                focusOtherTask={focusOtherTask}
                scrollToY={scrollToY}
                messageInputRef={messageInputRef}
                isLastTask={index === tasks.length - 1}
                isNewTask={task.id.includes('new-task')}
                isNextTaskEmpty={isNextTaskEmpty}
                onTaskCreated={handleTaskCreated}
                onTaskUpdated={handleTaskUpdated}
                focusOnLayout={task.id === newlyCreatedTaskId}
              />
            );
          })
        ) : (
          <SlotTask
            key={`new-task-${Date.now()}`}
            ref={ref => setTaskRef('new-task', ref)}
            task={{
              id: 'new-task',
              text: '',
              is_done: false,
              position: 0,
            }}
            slot={selectedSlot!}
            handleAddTask={handleAddTask}
            handleRemoveTask={handleRemoveTask}
            focusOtherTask={focusOtherTask}
            scrollToY={scrollToY}
            messageInputRef={messageInputRef}
            isLastTask={true}
            isNewTask={true}
            isNextTaskEmpty={false}
            onTaskCreated={handleTaskCreated}
            onTaskUpdated={handleTaskUpdated}
          />
        )}
      </View>
    );
  }
);

SlotTaskList.displayName = 'SlotTaskList';
