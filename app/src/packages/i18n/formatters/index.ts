import dayjs from 'dayjs';
import { getCurrentLocale, localeConfig } from '../locale';
import { translations } from '../translations';

export const formatMonthYear = (
  date: Date | string
): { month: string; year: number } => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = getCurrentLocale();
  const dateFormat = localeConfig[locale].dateFormat;

  const month = dateObj.toLocaleDateString(dateFormat, { month: 'long' });
  const year = dateObj.getFullYear();

  return { month, year };
};

export const formatDay = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = getCurrentLocale();
  const dateFormat = localeConfig[locale].dateFormat;

  return dateObj.toLocaleDateString(dateFormat, { weekday: 'short' });
};

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = getCurrentLocale();
  const dateFormat = localeConfig[locale].dateFormat;

  return dateObj.toLocaleDateString(dateFormat);
};

export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = getCurrentLocale();
  const dateFormat = localeConfig[locale].dateFormat;

  return dateObj.toLocaleTimeString(dateFormat, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDuration = (
  startTime: string | null,
  endTime: string | null
): string => {
  if (!startTime || !endTime) return '';

  const start = dayjs(startTime);
  const end = dayjs(endTime);
  const diffMinutes = end.diff(start, 'minute');

  if (diffMinutes < 0) return '';

  const locale = getCurrentLocale();
  const t = translations[locale];

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (hours === 0) {
    return `${minutes}${t.minuteAbbreviation}`;
  }

  // Always use compact format: "2h30" instead of "2h 30min"
  const hourText = `${hours}${t.hourAbbreviation}`;

  if (minutes === 0) {
    return hourText;
  }

  // Use compact format without "min" suffix when hours > 0
  return `${hourText}${minutes < 10 ? '0' : ''}${minutes}`;
};
