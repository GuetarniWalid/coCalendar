import dayjs from 'dayjs';

/**
 * Checks if the slot spans the whole day (00:00 to 23:59)
 */
export const isWholeDay = (startTime: string | null, endTime: string | null): boolean => {
  if (!startTime || !endTime) return false;

  const start = dayjs(startTime, 'YYYY-MM-DD HH:mm:ss');
  const end = dayjs(endTime, 'YYYY-MM-DD HH:mm:ss');

  if (!start.isValid() || !end.isValid()) return false;

  // Check if start is at 00:00 and end is at 23:59
  return (
    start.hour() === 0 &&
    start.minute() === 0 &&
    end.hour() === 23 &&
    end.minute() === 59
  );
};

/**
 * Creates default whole day times for a given date
 */
export const createWholeDayTimes = (date?: Date) => {
  const baseDate = date ? dayjs(date) : dayjs();

  return {
    startTime: baseDate.hour(0).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss'),
    endTime: baseDate.hour(23).minute(59).second(59).format('YYYY-MM-DD HH:mm:ss')
  };
};