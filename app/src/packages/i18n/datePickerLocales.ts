import {
  en,
  fr,
  es,
  de,
  registerTranslation,
} from 'react-native-paper-dates';

export const registerDatePickerLocales = () => {
  registerTranslation('en', en);
  registerTranslation('fr', fr);
  registerTranslation('es', es);
  registerTranslation('de', de);
};
