import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Feature-based translations
import enCommon from '@/shared/locales/en.json';
import viCommon from '@/shared/locales/vi.json';
import enLogin from '@/features/authentication/locales/login/en.json';
import viLogin from '@/features/authentication/locales/login/vi.json';
import enFileUpload from '@/features/authentication/locales/fileUpload/en.json';
import viFileUpload from '@/features/authentication/locales/fileUpload/vi.json';
import enForgotPassword from '@/features/authentication/locales/forgotPassword/en.json';
import viForgotPassword from '@/features/authentication/locales/forgotPassword/vi.json';
import enResetPassword from '@/features/authentication/locales/resetPassword/en.json';
import viResetPassword from '@/features/authentication/locales/resetPassword/vi.json';
import viVerification from '@/features/authentication/locales/verification/vi.json';
import enVerification from '@/features/authentication/locales/verification/en.json';
import enProfile from '@/features/profile/locales/en.json';
import viProfile from '@/features/profile/locales/vi.json';
import enHome from '@/features/home/locales/en.json';
import viHome from '@/features/home/locales/vi.json';
import enNotifications from '@/features/notifications/locales/en.json';
import viNotifications from '@/features/notifications/locales/vi.json';
import enSignup from '@/features/authentication/locales/signup/en.json';
import viSignup from '@/features/authentication/locales/signup/vi.json';
import enStore from '@/features/authentication/locales/store/en.json';
import viStore from '@/features/authentication/locales/store/vi.json';
import viBiometric from '@/features/biometric/locales/vi.json';
import enBiometric from '@/features/biometric/locales/en.json';
import viStoreStatus from '@/shared/locales/storeStatus/vi.json';
import enStoreStatus from '@/shared/locales/storeStatus/en.json';

export const resources = {
  en: {
    common: enCommon,
    login: enLogin,
    fileUpload: enFileUpload,
    forgotPassword: enForgotPassword,
    resetPassword: enResetPassword,
    verification: enVerification,
    profile: enProfile,
    home: enHome,
    notifications: enNotifications,
    signup: enSignup,
    store: enStore,
    biometric: enBiometric,
    storeStatus: enStoreStatus,
  },
  vi: {
    common: viCommon,
    login: viLogin,
    fileUpload: viFileUpload,
    forgotPassword: viForgotPassword,
    resetPassword: viResetPassword,
    verification: viVerification,
    profile: viProfile,
    home: viHome,
    notifications: viNotifications,
    signup: viSignup,
    store: viStore,
    biometric: viBiometric,
    storeStatus: viStoreStatus,
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
      ns: ['common', 'login', 'forgotPassword', 'resetPassword', 'profile', 'home', 'notifications', 'signup', 'store', 'biometric', 'storeStatus'],
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
