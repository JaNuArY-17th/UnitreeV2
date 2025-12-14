/**
 * Authentication utility functions
 * Centralized logic for common authentication operations
 */

import type { LoginResponse, OTPVerificationResponse } from '../types/auth';

/**
 * Check if OTP verification is required based on API response
 */
export const isOTPRequired = (response: any): boolean => {
  if (!response) return false;

  // Normalize potential message field (server may nest inside wrapper as response.message)
  const message: string | undefined = response.message || response.data?.message;
  const lcMessage = message ? message.toLowerCase() : '';

  // Heuristics for English & Vietnamese backend messages:
  // Examples observed:
  //  - "Please verify with OTP"
  //  - "verify your OTP"
  //  - "Phát hiện thiết bị mới. Vui lòng xác thực bằng OTP."
  //  - "Vui lòng xác thực bằng OTP"
  //  - Any message containing both 'otp' and either 'verify' / 'xác thực' / 'thiết bị mới'
  const messageIndicatesOTP = !!lcMessage && (
    lcMessage.includes('verify with otp') ||
    lcMessage.includes('verify your otp') ||
    (lcMessage.includes('otp') && (
      lcMessage.includes('verify') ||
      lcMessage.includes('xác thực') || // Vietnamese: "xác thực" = verify
      lcMessage.includes('thiết bị mới') // Vietnamese: "thiết bị mới" = new device
    ))
  );

  // Flags can appear at root OR nested inside response.data depending on API shape
  const isNewDevice = response.is_new_device === true || response.data?.is_new_device === true;
  const isNotVerified = response.is_verified === false || response.data?.is_verified === false;

  return messageIndicatesOTP || isNewDevice || isNotVerified;
};

/**
 * Format phone number for API (add country code)
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add country code if not present
  if (cleaned.startsWith('0')) {
    return `84${cleaned.slice(1)}`;
  } else if (!cleaned.startsWith('84')) {
    return `84${cleaned}`;
  }
  
  return cleaned;
};

/**
 * Validate phone number format
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\s/g, '');
  return /^[0-9]{9,10}$/.test(cleaned);
};

/**
 * Validate password strength
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * Validate OTP code format
 */
export const isValidOTPCode = (code: string): boolean => {
  return /^[0-9]{6}$/.test(code);
};

/**
 * Check if response contains valid authentication tokens
 */
export const hasValidTokens = (response: LoginResponse | OTPVerificationResponse): boolean => {
  return !!(response.access_token && response.refresh_token);
};

/**
 * Extract error message from API response or error object
 */
export const getErrorMessage = (error: any, defaultMessage = 'An error occurred'): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.data?.message) return error.data.message;
  return defaultMessage;
};

/**
 * Check if error is a network/connection error
 */
export const isNetworkError = (error: any): boolean => {
  if (!error) return false;

  const isNetworkErr = (
    error.code === 'NETWORK_ERROR' ||
    error.message?.includes('Network Error') ||
    error.message?.includes('timeout') ||
    error.message?.includes('fetch')
  );

  return Boolean(isNetworkErr);
};

/**
 * Format display phone number (for UI)
 */
export const formatDisplayPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  // Remove country code for display
  if (cleaned.startsWith('84')) {
    return `0${cleaned.slice(2)}`;
  }
  
  return cleaned.startsWith('0') ? cleaned : `0${cleaned}`;
};

/**
 * Format phone number for international display: +84 9xxxxxxxx or +84 3xxxxxxxx
 * Input can be variants: 84XXXXXXXXX, 0XXXXXXXXX, +84XXXXXXXXX
 * Returns e.g. '+84 359028368'
 */
export const formatInternationalPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  let national: string;
  if (digits.startsWith('84')) {
    national = digits.slice(2);
  } else if (digits.startsWith('0')) {
    national = digits.slice(1);
  } else {
    national = digits;
  }
  return `+84 ${national}`;
};

/**
 * Mask phone number for security (show only last 4 digits)
 */
export const maskPhoneNumber = (phone: string): string => {
  const formatted = formatDisplayPhoneNumber(phone);
  if (formatted.length < 4) return formatted;
  
  const masked = '*'.repeat(formatted.length - 4);
  const lastFour = formatted.slice(-4);
  return `${masked}${lastFour}`;
};

/**
 * Generate OTP resend delay message
 */
export const getResendDelayMessage = (seconds: number): string => {
  if (seconds <= 0) return 'Resend OTP';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `Resend in ${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `Resend in ${seconds}s`;
};

/**
 * Auth constants
 */
export const AUTH_CONSTANTS = {
  OTP_LENGTH: 6,
  MIN_PASSWORD_LENGTH: 6,
  PHONE_MIN_LENGTH: 9,
  PHONE_MAX_LENGTH: 10,
  OTP_RESEND_DELAY: 60, // seconds
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes in ms
} as const;

/**
 * Auth validation messages
 */
export const AUTH_MESSAGES = {
  PHONE_REQUIRED: 'Phone number is required',
  PHONE_INVALID: 'Please enter a valid phone number',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_TOO_SHORT: `Password must be at least ${AUTH_CONSTANTS.MIN_PASSWORD_LENGTH} characters`,
  CONFIRM_PASSWORD_REQUIRED: 'Confirm password is required',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  REFERRAL_CODE_INVALID: 'Referral code must be at least 3 characters',
  OTP_REQUIRED: 'OTP code is required',
  OTP_INVALID: 'Please enter a valid 6-digit OTP code',
  LOGIN_FAILED: 'Login failed. Please try again.',
  REGISTER_FAILED: 'Registration failed. Please try again.',
  OTP_VERIFICATION_FAILED: 'OTP verification failed. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
} as const;

// ---------------------------------------------------------------------------
// Ephemeral credential cache (memory only)
// Used to auto-login after OTP verification for new-device flow so users
// don't have to re-enter their password. Cleared immediately after use.
// ---------------------------------------------------------------------------
let _pendingCredential: { phone_number: string; password: string } | null = null;

export const credentialCache = {
  set(creds: { phone_number: string; password: string }) {
    _pendingCredential = creds;
  },
  consume(): { phone_number: string; password: string } | null {
    const c = _pendingCredential;
    _pendingCredential = null;
    return c;
  },
  peek(): { phone_number: string; password: string } | null {
    return _pendingCredential;
  },
  clear() {
    _pendingCredential = null;
  }
};
