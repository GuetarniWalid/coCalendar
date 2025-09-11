import { useMemo } from 'react';
import { getCurrentLocale } from './locale';
import { translations, Translations } from './translations';

export const useTranslation = (): Translations => {
  return useMemo(() => {
    const locale = getCurrentLocale();
    return translations[locale];
  }, []);
};

export const t = (key: keyof Translations): string => {
  const locale = getCurrentLocale();
  const value = translations[locale][key];
  return typeof value === 'string' ? value : '';
};
