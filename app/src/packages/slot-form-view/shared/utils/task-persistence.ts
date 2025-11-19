import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskDiff } from './task-diff';

const PENDING_CHANGES_PREFIX = 'pending-tasks-';

export const savePendingChanges = async (
  slotId: string,
  diff: TaskDiff
): Promise<void> => {
  try {
    const key = `${PENDING_CHANGES_PREFIX}${slotId}`;
    await AsyncStorage.setItem(key, JSON.stringify(diff));
  } catch (error) {
    console.error('Error saving pending changes to local storage:', error);
  }
};

export const loadPendingChanges = async (
  slotId: string
): Promise<TaskDiff | null> => {
  try {
    const key = `${PENDING_CHANGES_PREFIX}${slotId}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading pending changes from local storage:', error);
    return null;
  }
};

export const clearPendingChanges = async (slotId: string): Promise<void> => {
  try {
    const key = `${PENDING_CHANGES_PREFIX}${slotId}`;
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing pending changes from local storage:', error);
  }
};

export const getAllPendingChanges = async (): Promise<
  Array<{ slotId: string; diff: TaskDiff }>
> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const pendingKeys = keys.filter(key => key.startsWith(PENDING_CHANGES_PREFIX));

    const results = await Promise.all(
      pendingKeys.map(async key => {
        const data = await AsyncStorage.getItem(key);
        const slotId = key.replace(PENDING_CHANGES_PREFIX, '');
        return {
          slotId,
          diff: data ? JSON.parse(data) : null,
        };
      })
    );

    return results.filter(r => r.diff !== null);
  } catch (error) {
    console.error('Error getting all pending changes:', error);
    return [];
  }
};
