import dayjs from 'dayjs';
import { CALENDAR_CONSTANTS } from '@project/shared';

export const getDateFromIndex = (index: number): string => {
  return dayjs(CALENDAR_CONSTANTS.ORIGIN_DATE)
    .add(index, 'day')
    .format('YYYY-MM-DD');
};

export const getIndexFromDate = (date: string): number => {
  return dayjs(date).diff(dayjs(CALENDAR_CONSTANTS.ORIGIN_DATE), 'day');
};

export const createDefaultSlot = (startTime: string, endTime: string) => ({
  id: 'default-slot',
  title: '',
  startTime,
  endTime,
  type: 'private' as const,
  visibility: 'private',
});
