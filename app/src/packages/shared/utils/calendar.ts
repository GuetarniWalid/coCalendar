import dayjs from 'dayjs';
import { DayItem, SlotItem } from '../types/calendar';

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

    if (taskDate < currentDate) {
      completedTasks++;
    } else if (taskDate === currentDate) {
      if (taskEndTime && currentTime && taskEndTime <= currentTime) {
        completedTasks++;
      }
    }
  }

  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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

export const formatTime = (isoTimeString: string): string => {
  try {
    return dayjs(isoTimeString).format('HH:mm');
  } catch {
    return '--:--';
  }
};


