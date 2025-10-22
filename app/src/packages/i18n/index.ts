// Main i18n package exports
export {
  getDeviceLocale,
  getCurrentLocale,
  setLocale,
  localeConfig,
  type SupportedLocale,
} from './locale';
export { formatMonthYear } from './formatters';
export { translations, type Translations } from './translations';
export { useTranslation, t } from './hooks';
