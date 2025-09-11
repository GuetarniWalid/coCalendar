import { SlotItem, DayItem } from './types';
import dayjs from 'dayjs';

/**
 * Calculate task completion percentage based on current date/time
 * Tasks from previous dates are considered 100% completed
 * Tasks from future dates are considered 0% completed
 * Tasks from today are considered completed if their end time has passed
 */
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
  
  // If viewing a past date, all tasks are 100% completed
  if (selectedDate < currentDate) {
    return { completedTasks: totalTasks, totalTasks, percentage: 100 };
  }
  
  // If viewing a future date, all tasks are 0% completed
  if (selectedDate > currentDate) {
    return { completedTasks: 0, totalTasks, percentage: 0 };
  }
  
  for (const task of tasks) {
    const taskDate = dayjs(task.startTime).format('YYYY-MM-DD');
    const taskEndTime = dayjs(task.endTime).format('HH:mm:ss');
    
    if (!taskDate || !currentDate) continue;
    
    if (taskDate < currentDate) {
      // Task is from a previous date - consider it completed
      completedTasks++;
    } else if (taskDate === currentDate) {
      // Task is from today - check if end time has passed
      if (taskEndTime && currentTime && taskEndTime <= currentTime) {
        completedTasks++;
      }
    }
    // Tasks from future dates remain 0% completed
  }
  
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  return {
    completedTasks,
    totalTasks,
    percentage
  };
};

/**
 * Generate a list of days for the date selector
 */
export const generateDaysList = (selectedDate: string): DayItem[] => {
  const today = dayjs();
  const selected = dayjs(selectedDate);
  const days: DayItem[] = [];
  
  // Generate 7 days around the selected date
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
        isToday
      });
    }
  }
  
  return days;
};

/**
 * Generate exactly 7 consecutive days starting from startDate (inclusive)
 */
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

/**
 * Format time string from ISO format to readable time
 */
export { formatTime } from '@project/shared';