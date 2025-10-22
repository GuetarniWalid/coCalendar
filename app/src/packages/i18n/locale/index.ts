import { NativeModules, Platform } from 'react-native';

export type SupportedLocale = 'en' | 'fr' | 'es' | 'de';

// Get device locale
export const getDeviceLocale = (): SupportedLocale => {
  const deviceLanguage =
    Platform.OS === 'ios'
      ? NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages[0]
      : NativeModules.I18nManager.localeIdentifier;

  const locale = deviceLanguage?.split(/[-_]/)[0] || 'en';

  // Map to supported locales
  const supportedLocales: Record<string, SupportedLocale> = {
    en: 'en',
    fr: 'fr',
    es: 'es',
    de: 'de',
  };

  return supportedLocales[locale] || 'en';
};

// Current locale state
let currentLocale: SupportedLocale = getDeviceLocale();

export const getCurrentLocale = (): SupportedLocale => currentLocale;

export const setLocale = (locale: SupportedLocale): void => {
  currentLocale = locale;
};

// Locale configuration
export const localeConfig = {
  en: {
    code: 'en',
    name: 'English',
    dateFormat: 'en-US',
  },
  fr: {
    code: 'fr',
    name: 'Français',
    dateFormat: 'fr-FR',
  },
  es: {
    code: 'es',
    name: 'Español',
    dateFormat: 'es-ES',
  },
  de: {
    code: 'de',
    name: 'Deutsch',
    dateFormat: 'de-DE',
  },
} as const;
