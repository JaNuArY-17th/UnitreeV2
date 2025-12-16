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

export const resources = {
  en: {
    common: enCommon,
    login: enLogin,
    register: enRegister,
    forgotPassword: enForgotPassword,
  },
  vi: {
    common: viCommon,
    login: viLogin,
    register: viRegister,
    forgotPassword: viForgotPassword,
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
    console.log('[i18n] Loaded language preference from AsyncStorage:', stored);
  } catch (error) {
    // AsyncStorage not available, use default language
    console.log('[i18n] AsyncStorage not available, using default language');
  }

  // Initialize i18n
  if (!i18n.isInitialized) {
    console.log('[i18n] Initializing i18n with language:', lng);
    await i18n.use(initReactI18next).init({
      compatibilityJSON: 'v4',
      resources,
      lng,
      fallbackLng: 'vi',
      ns: ['common', 'login', 'register', 'forgotPassword'],
      defaultNS: 'common',
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
      debug: true, // Enable i18next debug mode
    });
    console.log('[i18n] Initialization complete, current language:', i18n.language);
  } else {
    console.log('[i18n] i18n already initialized, current language:', i18n.language);
  }
  return i18n;
}

export default i18n;
export const setLanguage = async (lng: 'en' | 'vi') => {
  console.log('[i18n] setLanguage called with:', lng);
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    console.log('[i18n] Language preference saved to AsyncStorage');
  } catch (error) {
    console.warn('[i18n] Failed to save language preference:', error);
  }
  
  console.log('[i18n] Calling i18n.changeLanguage with:', lng);
  const result = await i18n.changeLanguage(lng);
  console.log('[i18n] i18n.changeLanguage result, new language:', result);
  console.log('[i18n] i18n.language after change:', i18n.language);
  
  return result;
};
