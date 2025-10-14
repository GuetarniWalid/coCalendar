import dayjs from 'dayjs';
import { getCurrentLocale, localeConfig } from '@project/i18n';

/**
 * Formats time string according to current locale
 * @param isoTimeString - ISO format time string
 * @returns Formatted time string (e.g., "14:30" or "02:30 PM")
 */
export const formatTimeByLocale = (isoTimeString: string | null): string => {
  if (!isoTimeString) return '--:--';

  try {
    const locale = getCurrentLocale();
    const dateFormat = localeConfig[locale].dateFormat;
    const is12Hour = dateFormat === 'en-US';

    if (is12Hour) {
      return dayjs(isoTimeString).format('hh:mm a');
    } else {
      return dayjs(isoTimeString).format('HH:mm');
    }
  } catch {
    return '--:--';
  }
};
