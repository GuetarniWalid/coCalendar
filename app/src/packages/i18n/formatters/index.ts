import { getCurrentLocale, localeConfig } from '../locale';

export const formatMonthYear = (date: Date | string): { month: string; year: number } => {
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
    minute: '2-digit' 
  });
};
