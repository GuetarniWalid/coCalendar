import dayjs from 'dayjs';
import { DayItem, SlotItem } from '../types/calendar';
import { Translations } from '@project/i18n';

export const calculateTaskCompletion = (
  tasks: SlotItem[],
  selectedDate: string
): { completedTasks: number; totalTasks: number; percentage: number } => {
  if (!tasks || !Array.isArray(tasks)) {
    return { completedTasks: 0, totalTasks: 0, percentage: 0 };
  }

  const now = dayjs();
  const currentDate = now.format('YYYY-MM-DD');
  const currentTime = now.format('HH:mm:ss');

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
    const taskDate = dayjs(task.startTime).format('YYYY-MM-DD');
    const taskEndTime = dayjs(task.endTime).format('HH:mm:ss');

    if (!taskDate || !currentDate) continue;

    // Check if task is manually marked as completed
    if (task.completed) {
      completedTasks++;
    } else if (taskDate < currentDate) {
      // Task is from a previous date - consider it completed
      completedTasks++;
    } else if (taskDate === currentDate) {
      // Task is from today - check if end time has passed
      if (taskEndTime && currentTime && taskEndTime <= currentTime) {
        completedTasks++;
      }
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

/**
 * Formats remaining time into a human-readable string with seconds precision
 * Returns formatted string like "45 min", "1h 30min", "38 secondes", etc.
 * Uses internationalization for proper language support
 */
export const formatRemainingTime = (
  startTime: string | null,
  endTime: string | null,
  t: Translations
): string | null => {
  try {
    if (!startTime || !endTime) return null;

    // Always use fresh current time for maximum precision
    const now = dayjs();
    const end = dayjs(endTime);

    // Check if we're within the time range or the event has ended
    const start = dayjs(startTime);
    if (now.isBefore(start)) {
      return null; // Event hasn't started yet
    }

    // Calculate remaining duration in milliseconds
    const remainingMs = end.diff(now);

    // If time is up or past end time, return null (no text shown)
    if (remainingMs <= 0) {
      return null;
    }

    const totalSeconds = Math.floor(remainingMs / 1000);

    // If less than 1 minute, show seconds
    if (totalSeconds < 60) {
      const unit = totalSeconds === 1 ? t.secondsSingular : t.secondsPlural;
      return `${t.remainingPrefix} ${totalSeconds} ${unit}`;
    }

    const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));

    // If less than 1 hour, show minutes
    if (remainingMinutes < 60) {
      const unit = remainingMinutes === 1 ? t.minutesSingular : t.minutesPlural;
      return `${t.remainingPrefix} ${remainingMinutes} ${unit}`;
    }

    // Show hours and minutes
    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;

    if (minutes === 0) {
      return `${t.remainingPrefix} ${hours}h`;
    }

    return `${t.remainingPrefix} ${hours}h ${minutes}${t.minutesPlural}`;
  } catch {
    return null;
  }
};
