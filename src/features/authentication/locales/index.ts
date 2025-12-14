import { loginTranslations } from './login';
import { signupLocales } from './signup';
import { forgotPasswordLocales } from './forgotPassword';
import { resetPasswordLocales } from './resetPassword';
import { verificationLocales } from './verification';
import storeVi from './store/vi.json';
import storeEn from './store/en.json';
import fileUploadVi from './fileUpload/vi.json';
import fileUploadEn from './fileUpload/en.json';

export const authenticationLocales = {
  login: loginTranslations,
  signup: signupLocales,
  forgotPassword: forgotPasswordLocales,
  resetPassword: resetPasswordLocales,
  verification: verificationLocales,
  store: {
    vi: storeVi,
    en: storeEn,
  },
  fileUpload: {
    vi: fileUploadVi,
    en: fileUploadEn,
  },
};
