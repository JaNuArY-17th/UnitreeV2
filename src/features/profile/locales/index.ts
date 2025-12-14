import en from './en.json';
import vi from './vi.json';

export const profileLocales = {
  en,
  vi,
};

export type ProfileTranslationKeys = keyof typeof en;
