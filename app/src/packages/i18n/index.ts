// Main i18n package exports
export {
  getDeviceLocale,
  getCurrentLocale,
  setLocale,
  localeConfig,
  type SupportedLocale,
} from './locale';
export { formatMonthYear, formatTime, formatDate, formatDay } from './formatters';
export { translations, type Translations } from './translations';
export { useTranslation, t } from './hooks';

// Register date picker locales for react-native-paper-dates
import { registerDatePickerLocales } from './datePickerLocales';
registerDatePickerLocales();
