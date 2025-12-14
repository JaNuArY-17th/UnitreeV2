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
import viTransaction from '@/features/transactions/locales/vi.json';
import enTransaction from '@/features/transactions/locales/en.json';
import viPayment from '@/features/payment/locales/vi.json';
import enPayment from '@/features/payment/locales/en.json';
import enDeposit from '@/features/deposit/locales/en.json';
import viDeposit from '@/features/deposit/locales/vi.json';
import enWithdraw from '@/features/deposit/locales/withdraw/en.json';
import viWithdraw from '@/features/deposit/locales/withdraw/vi.json';
import enReport from '@/features/report/locales/en.json';
import viReport from '@/features/report/locales/vi.json';
import enNotifications from '@/features/notifications/locales/en.json';
import viNotifications from '@/features/notifications/locales/vi.json';
import enAccount from '@/features/account/locales/en.json';
import viAccount from '@/features/account/locales/vi.json';
import enSignup from '@/features/authentication/locales/signup/en.json';
import viSignup from '@/features/authentication/locales/signup/vi.json';
import enStore from '@/features/authentication/locales/store/en.json';
import viStore from '@/features/authentication/locales/store/vi.json';
import viEkyc from '@/features/ekyc/locales/vi.json';
import enEkyc from '@/features/ekyc/locales/en.json';
import viBanks from '@/features/banks/locales/vi.json';
import enBanks from '@/features/banks/locales/en.json';
import viBiometric from '@/features/biometric/locales/vi.json';
import enBiometric from '@/features/biometric/locales/en.json';
import viCommission from '@/features/commission/locales/vi.json';
import enCommission from '@/features/commission/locales/en.json';
import viCart from '@/features/cart/locales/vi.json';
import enCart from '@/features/cart/locales/en.json';
import viOrder from '@/features/order/locales/vi.json';
import enOrder from '@/features/order/locales/en.json';
import enProduct from '@/features/product/locales/en.json';
import viProduct from '@/features/product/locales/vi.json';
import viVoucher from '@/features/voucher/locales/vi.json';
import enVoucher from '@/features/voucher/locales/en.json';
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
    transactions: enTransaction,
    payment: enPayment,
    deposit: enDeposit,
    withdraw: enWithdraw,
    report: enReport,
    notifications: enNotifications,
    account: enAccount,
    signup: enSignup,
    store: enStore,
    ekyc: enEkyc,
    banks: enBanks,
    biometric: enBiometric,
    commission: enCommission,
    cart: enCart,
    order: enOrder,
    product: enProduct,
    voucher: enVoucher,
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
    transactions: viTransaction,
    payment: viPayment,
    deposit: viDeposit,
    withdraw: viWithdraw,
    report: viReport,
    notifications: viNotifications,
    account: viAccount,
    signup: viSignup,
    store: viStore,
    ekyc: viEkyc,
    banks: viBanks,
    biometric: viBiometric,
    commission: viCommission,
    cart: viCart,
    order: viOrder,
    product: viProduct,
    voucher: viVoucher,
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
      ns: ['common', 'login', 'forgotPassword', 'resetPassword', 'profile', 'home', 'transactions', 'payment', 'deposit', 'withdraw', 'report', 'notifications', 'account', 'signup', 'store', 'cart', 'order', 'storeStatus'],
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
