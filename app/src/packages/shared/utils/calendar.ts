import dayjs from 'dayjs';
import { DayItem, SlotItem } from '../types/calendar';

const isDayPassed = (startTime: string | null): boolean => {
  if (!startTime) return false;
  const slotDate = new Date(startTime);
  const today = new Date();
  slotDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return slotDate < today;
};

const isSlotTimeBasedCompleted = (slot: SlotItem, now: Date): boolean => {
  if (!slot.endTime) {
    return isDayPassed(slot.startTime);
  }

  const endTimeDate = new Date(slot.endTime);
  return now >= endTimeDate;
};

export const isSlotCompleted = (slot: SlotItem, now?: Date): boolean => {
  if (slot.completionStatus === 'completed') return true;
  if (slot.completionStatus === 'incomplete') return false;

  const currentTime = now || new Date();
  return isSlotTimeBasedCompleted(slot, currentTime);
};

export const calculateTaskCompletion = (
  tasks: SlotItem[],
  selectedDate: string
): { completedTasks: number; totalTasks: number; percentage: number } => {
  if (!tasks || !Array.isArray(tasks)) {
    return { completedTasks: 0, totalTasks: 0, percentage: 0 };
  }

  const now = new Date();
  const currentDate = dayjs(now).format('YYYY-MM-DD');

  if (!currentDate) {
    return { completedTasks: 0, totalTasks: 0, percentage: 0 };
  }

  let completedTasks = 0;
  const totalTasks = tasks.length;

  if (selectedDate < currentDate) {
    return { completedTasks: totalTasks, totalTasks, percentage: 100 };
  }

  if (selectedDate > currentDate) {
    return { completedTasks: 0, totalTasks, percentage: 0 };
  }

  for (const task of tasks) {
    if (task.completionStatus === 'completed') {
      completedTasks++;
    } else if (isSlotTimeBasedCompleted(task, now)) {
      completedTasks++;
    }
  }

  const percentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    completedTasks,
    totalTasks,
    percentage,
  };
};

export const generateDaysList = (selectedDate: string): DayItem[] => {
  const today = dayjs();
  const selected = dayjs(selectedDate);
  const days: DayItem[] = [];

  for (let i = -3; i <= 3; i++) {
    const date = selected.add(i, 'day');
    const dateString = date.format('YYYY-MM-DD');
    const dayName = date.format('ddd');
    const isToday = dateString === today.format('YYYY-MM-DD');
    const isSelected = dateString === selectedDate;

    if (dateString) {
      days.push({
        date: dateString,
        day: dayName,
        isSelected,
        isToday,
      });
    }
  }

  return days;
};

export const generateWeekDays = (startDate: string): DayItem[] => {
  const today = dayjs();
  const start = dayjs(startDate);
  const days: DayItem[] = [];

  for (let i = 0; i < 7; i++) {
    const date = start.add(i, 'day');
    const dateString = date.format('YYYY-MM-DD');
    const dayName = date.format('ddd');
    const isToday = dateString === today.format('YYYY-MM-DD');
    days.push({
      date: dateString,
      day: dayName,
      isSelected: false,
      isToday,
    });
  }

  return days;
};

export const formatTime = (isoTimeString: string | null): string => {
  if (!isoTimeString) {
    return '--:--';
  }

  try {
    return dayjs(isoTimeString).format('HH:mm');
  } catch {
    return '--:--';
  }
};

/**
 * Determines if a slot has specific time (hours/minutes) or is a date-only slot
 * Date-only slots (punctual tasks) should not show progress bars
 */
export const hasSpecificTime = (isoTimeString: string | null): boolean => {
  if (!isoTimeString) return false;

  try {
    const date = dayjs(isoTimeString);
    // Check if the time component is at midnight (00:00:00)
    // Date-only slots typically have start/end times at midnight
    const timeString = date.format('HH:mm:ss');
    return timeString !== '00:00:00';
  } catch {
    return false;
  }
};

/**
 * Calculates the elapsed time percentage for a currently active slot
 * Returns percentage of time that has passed (0% at start, 100% at end)
 * Returns null if slot is not currently active or doesn't have specific times
 */
export const calculateSlotProgress = (
  startTime: string | null,
  endTime: string | null
): { percentage: number; isCompleted: boolean } | null => {
  try {
    // Check if this slot has specific times
    if (
      !startTime ||
      !endTime ||
      !hasSpecificTime(startTime) ||
      !hasSpecificTime(endTime)
    ) {
      return null;
    }

    // Always use fresh current time for maximum precision
    const now = dayjs();
    const start = dayjs(startTime);
    const end = dayjs(endTime);

    // Check if current time is before the slot starts
    if (now.isBefore(start)) {
      return null;
    }

    // If the slot has ended, return 100% (completed)
    if (now.isAfter(end)) {
      return { percentage: 100, isCompleted: true };
    }

    const totalDuration = end.diff(start);
    const elapsedDuration = now.diff(start);

    // Calculate elapsed percentage (how much time has passed)
    const elapsedPercentage = (elapsedDuration / totalDuration) * 100;

    return {
      percentage: Math.max(0, Math.min(100, elapsedPercentage)),
      isCompleted: false,
    };
  } catch {
    return null;
  }
};
