// Main i18n package exports
export {
  getDeviceLocale,
  getCurrentLocale,
  setLocale,
  localeConfig,
  type SupportedLocale,
} from './locale';
export { formatMonthYear, formatTime, formatDate, formatDay, formatDuration } from './formatters';
export { translations, type Translations } from './translations';
export { useTranslation, t } from './hooks';
