import { loginTranslations } from './login';
import { signupLocales } from './signup';
import { forgotPasswordLocales } from './forgotPassword';
import { resetPasswordLocales } from './resetPassword';
import fileUploadVi from './fileUpload/vi.json';
import fileUploadEn from './fileUpload/en.json';

export const authenticationLocales = {
  login: loginTranslations,
  signup: signupLocales,
  forgotPassword: forgotPasswordLocales,
  resetPassword: resetPasswordLocales,
  fileUpload: {
    vi: fileUploadVi,
    en: fileUploadEn,
  },
};
