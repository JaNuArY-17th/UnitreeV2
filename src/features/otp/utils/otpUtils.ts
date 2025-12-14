import type { OTPFormData, OTPFormErrors, OTPType } from '../types';

// OTP validation utilities
export const isValidOTPCode = (otp: string, length = 6): boolean => {
  return /^\d+$/.test(otp) && otp.length === length;
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Add country code if not present (without + prefix to match auth service)
  if (cleaned.startsWith('0')) {
    return `84${cleaned.slice(1)}`;
  } else if (!cleaned.startsWith('84')) {
    return `84${cleaned}`;
  }

  return cleaned;
};

export const maskPhoneNumber = (phone: string): string => {
  if (!phone) return '';

  // Remove country code for display
  const cleaned = phone.replace(/^\+84/, '0');

  if (cleaned.length <= 4) return cleaned;

  // Mask middle digits: 0123456789 -> 0123***789
  const start = cleaned.slice(0, 4);
  const end = cleaned.slice(-3);
  const middle = '*'.repeat(Math.max(0, cleaned.length - 7));

  return `${start}${middle}${end}`;
};

export const validateOTPForm = (
  data: OTPFormData,
  t: (key: string, options?: any) => string,
  codeLength = 6
): OTPFormErrors => {
  const errors: OTPFormErrors = {};

  // Phone validation
  if (!data.phone.trim()) {
    errors.phone = t('error.phoneRequired');
  }

  // OTP validation
  if (!data.otp.trim()) {
    errors.otp = t('error.otpRequired');
  } else if (!isValidOTPCode(data.otp, codeLength)) {
    errors.otp = t('error.otpInvalid');
  }

  return errors;
};

// Get display title for OTP type
export const getOTPTypeTitle = (
  type: OTPType,
  t: (key: string, options?: any) => string
): string => {
  switch (type) {
    case 'register':
      return t('title.register', 'Verify Registration');
    case 'login-new-device':
      return t('title.loginNewDevice', 'Verify New Device');
    case 'forgot-password':
      return t('title.forgotPassword', 'Verify Identity');
    case 'withdraw':
      return t('title.withdraw', 'Verify Withdrawal');
    case 'bank-withdraw':
      return t('title.bankWithdraw', 'Verify Withdrawal');
    case 'trading':
      return t('title.trading', 'Verify Transaction');
    case 'term-deposit-purchase':
      return t('title.termDepositPurchase', 'Verify Purchase');
    case 'econtract-signing':
      return t('title.econtractSigning', 'Verify E-Contract');
    case 'loan-application':
      return t('title.loanApplication', 'Verify Loan Application');
    case 'loan-payment':
      return t('title.loanPayment', 'Verify Payment');
    case 'bank-transfer':
      return t('title.bankTransfer', 'Verify Transfer');
    default:
      return t('title.general', 'Verify OTP');
  }
};

// Get display subtitle for OTP type
export const getOTPTypeSubtitle = (
  type: OTPType,
  phone: string,
  t: (key: string, options?: any) => string
): string => {
  const maskedPhone = maskPhoneNumber(phone);

  switch (type) {
    case 'withdraw':
      return t('subtitle.withdraw', 'Enter the 6-digit code to confirm your withdrawal');
    case 'bank-withdraw':
      return t('subtitle.bankWithdraw', 'Enter the 6-digit code to confirm your bank withdrawal');
    case 'trading':
      return t('subtitle.trading', 'Enter the 6-digit code to confirm your trade order');
    case 'term-deposit-purchase':
      return t('subtitle.termDepositPurchase', 'Enter the 6-digit code to confirm your investment');
    case 'econtract-signing':
      return t('subtitle.econtractSigning', 'Enter the 6-digit code to sign the contract');
    case 'loan-application':
      return t('subtitle.loanApplication', 'Enter the 6-digit code to confirm your loan application');
    case 'loan-payment':
      return t('subtitle.loanPayment', 'Enter the 6-digit code to confirm your payment');
    case 'bank-transfer':
      return t('subtitle.bankTransfer', 'Enter the 6-digit code to confirm your transfer');
    default:
      return t('subtitle.general', 'Enter the 6-digit code sent to {{phone}}', { phone: maskedPhone });
  }
};

// Get success message for OTP type
export const getOTPSuccessMessage = (
  type: OTPType,
  t: (key: string, options?: any) => string
): { title: string; message: string } => {
  switch (type) {
    case 'register':
      return {
        title: t('success.register.title', 'Registration Complete'),
        message: t('success.register.message', 'Your account has been verified successfully. Please login to continue.'),
      };
    case 'login-new-device':
      return {
        title: t('success.loginNewDevice.title', 'Device Verified'),
        message: t('success.loginNewDevice.message', 'Your new device has been verified successfully. Please login to continue.'),
      };
    case 'forgot-password':
      return {
        title: t('success.forgotPassword.title', 'Identity Verified'),
        message: t('success.forgotPassword.message', 'Your identity has been verified. You can now reset your password.'),
      };
    case 'withdraw':
      return {
        title: t('success.withdraw.title', 'Withdrawal Verified'),
        message: t('success.withdraw.message', 'Your withdrawal has been verified successfully.'),
      };
    case 'bank-withdraw':
      return {
        title: t('success.bankWithdraw.title', 'Withdrawal Verified'),
        message: t('success.bankWithdraw.message', 'Your bank withdrawal has been verified successfully.'),
      };
    case 'trading':
      return {
        title: t('success.trading.title', 'Transaction Verified'),
        message: t('success.trading.message', 'Your trade order has been verified successfully.'),
      };
    case 'term-deposit-purchase':
      return {
        title: t('success.termDepositPurchase.title', 'Purchase Verified'),
        message: t('success.termDepositPurchase.message', 'Your investment has been verified successfully.'),
      };
    case 'econtract-signing':
      return {
        title: t('success.econtractSigning.title', 'Contract Signed'),
        message: t('success.econtractSigning.message', 'Your e-contract has been signed successfully.'),
      };
    case 'loan-application':
      return {
        title: t('success.loanApplication.title', 'Application Verified'),
        message: t('success.loanApplication.message', 'Your loan application has been verified successfully.'),
      };
    case 'loan-payment':
      return {
        title: t('success.loanPayment.title', 'Payment Verified'),
        message: t('success.loanPayment.message', 'Your loan payment has been verified successfully.'),
      };
    case 'bank-transfer':
      return {
        title: t('success.bankTransfer.title', 'Transfer Verified'),
        message: t('success.bankTransfer.message', 'Your bank transfer has been verified successfully.'),
      };
    default:
      return {
        title: t('success.general.title', 'Verification Complete'),
        message: t('success.general.message', 'OTP verification successful.'),
      };
  }
};
