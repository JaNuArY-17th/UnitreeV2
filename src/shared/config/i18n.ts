import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Feature-based translations
import enCommon from '@/shared/locales/en.json';
import viCommon from '@/shared/locales/vi.json';
import enLogin from '@/features/authentication/locales/login/en.json';
import viLogin from '@/features/authentication/locales/login/vi.json';
import enRegister from '@/features/authentication/locales/register/en.json';
import viRegister from '@/features/authentication/locales/register/vi.json';
import enForgotPassword from '@/features/authentication/locales/forgot-password/en.json';
import viForgotPassword from '@/features/authentication/locales/forgot-password/vi.json';
import enWifi from '@/features/wifi/locales/en.json';
import viWifi from '@/features/wifi/locales/vi.json';

export const resources = {
  en: {
    common: enCommon,
    login: enLogin,
    register: enRegister,
    forgotPassword: enForgotPassword,
    wifi: enWifi,
  },
  vi: {
    common: viCommon,
    login: viLogin,
    register: viRegister,
    forgotPassword: viForgotPassword,
    wifi: viWifi,
  },
} as const;

// Default language; you can call i18n.changeLanguage('vi') at runtime to change language
export const LANGUAGE_STORAGE_KEY = 'app_language';

export async function initI18n() {
  let lng = 'vi';

  // Try to load saved language preference
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'en' || stored === 'vi') lng = stored;
  } catch (error) {
    // AsyncStorage not available, use default language
    console.log('Using default language, AsyncStorage not available');
  }

  // Initialize i18n
  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      compatibilityJSON: 'v4',
      resources,
      lng,
      fallbackLng: 'vi',
      ns: ['common', 'login', 'register', 'forgotPassword', 'wifi'],
      defaultNS: 'common',
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    });
  }
  return i18n;
}

export default i18n;
export const setLanguage = async (lng: 'en' | 'vi') => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  } catch (error) {
    console.warn('Failed to save language preference:', error);
  }
  return i18n.changeLanguage(lng);
};
