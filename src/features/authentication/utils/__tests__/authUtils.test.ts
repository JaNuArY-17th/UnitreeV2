/**
 * Tests for authentication utilities
 */

import {
  isOTPRequired,
  formatPhoneNumber,
  formatDisplayPhoneNumber,
  maskPhoneNumber,
  formatInternationalPhoneNumber,
  isValidPhoneNumber,
  isValidPassword,
  isValidOTPCode,
  hasValidTokens,
  getErrorMessage,
  isNetworkError,
  getResendDelayMessage,
  AUTH_CONSTANTS,
  AUTH_MESSAGES,
} from '../authUtils';

describe('authUtils', () => {
  describe('isOTPRequired', () => {
    it('should return true when OTP is required', () => {
      expect(isOTPRequired({ message: 'Please verify with OTP' })).toBe(true);
      expect(isOTPRequired({ message: 'verify your OTP' })).toBe(true);
      expect(isOTPRequired({ is_new_device: true })).toBe(true);
      expect(isOTPRequired({ is_verified: false })).toBe(true);
  // Vietnamese messages
  expect(isOTPRequired({ message: 'Phát hiện thiết bị mới. Vui lòng xác thực bằng OTP.' })).toBe(true);
  expect(isOTPRequired({ message: 'Vui lòng xác thực bằng OTP' })).toBe(true);
  // Nested flags
  expect(isOTPRequired({ data: { is_new_device: true } })).toBe(true);
  expect(isOTPRequired({ data: { is_verified: false } })).toBe(true);
    });

    it('should return false when OTP is not required', () => {
      expect(isOTPRequired(null)).toBe(false);
      expect(isOTPRequired({})).toBe(false);
      expect(isOTPRequired({ message: 'Login successful' })).toBe(false);
      expect(isOTPRequired({ is_new_device: false, is_verified: true })).toBe(false);
    });
  });

  describe('formatPhoneNumber', () => {
    it('should add country code to phone numbers starting with 0', () => {
      expect(formatPhoneNumber('0987654321')).toBe('84987654321');
      expect(formatPhoneNumber('0123456789')).toBe('84123456789');
    });

    it('should add country code to phone numbers without country code', () => {
      expect(formatPhoneNumber('987654321')).toBe('84987654321');
      expect(formatPhoneNumber('123456789')).toBe('84123456789');
    });

    it('should keep phone numbers that already have country code', () => {
      expect(formatPhoneNumber('84987654321')).toBe('84987654321');
      expect(formatPhoneNumber('84123456789')).toBe('84123456789');
    });

    it('should remove non-digit characters', () => {
      expect(formatPhoneNumber('098-765-4321')).toBe('84987654321');
      expect(formatPhoneNumber('098 765 4321')).toBe('84987654321');
      expect(formatPhoneNumber('+84987654321')).toBe('84987654321');
    });
  });

  describe('formatDisplayPhoneNumber', () => {
    it('should format phone numbers for display', () => {
      expect(formatDisplayPhoneNumber('84987654321')).toBe('0987654321');
      expect(formatDisplayPhoneNumber('987654321')).toBe('0987654321');
      expect(formatDisplayPhoneNumber('0987654321')).toBe('0987654321');
    });
  });

  describe('maskPhoneNumber', () => {
    it('should mask phone numbers for security', () => {
      expect(maskPhoneNumber('0987654321')).toBe('******4321');
      expect(maskPhoneNumber('84987654321')).toBe('******4321');
    });

    it('should handle short phone numbers', () => {
      expect(maskPhoneNumber('123')).toBe('0123'); // formatDisplayPhoneNumber adds 0 prefix
    });
  });

  describe('formatInternationalPhoneNumber', () => {
    it('should format variants to international form', () => {
      expect(formatInternationalPhoneNumber('84359028368')).toBe('+84 359028368');
      expect(formatInternationalPhoneNumber('+84876543210')).toBe('+84 876543210');
      expect(formatInternationalPhoneNumber('0359028368')).toBe('+84 359028368');
    });
  });

  describe('isValidPhoneNumber', () => {
    it('should validate correct phone numbers', () => {
      expect(isValidPhoneNumber('987654321')).toBe(true);
      expect(isValidPhoneNumber('0987654321')).toBe(true);
      expect(isValidPhoneNumber('098 765 4321')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhoneNumber('12345')).toBe(false);
      expect(isValidPhoneNumber('12345678901')).toBe(false);
      expect(isValidPhoneNumber('abc123456')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should validate correct passwords', () => {
      expect(isValidPassword('123456')).toBe(true);
      expect(isValidPassword('password123')).toBe(true);
    });

    it('should reject short passwords', () => {
      expect(isValidPassword('12345')).toBe(false);
      expect(isValidPassword('')).toBe(false);
    });
  });

  describe('isValidOTPCode', () => {
    it('should validate correct OTP codes', () => {
      expect(isValidOTPCode('123456')).toBe(true);
      expect(isValidOTPCode('000000')).toBe(true);
    });

    it('should reject invalid OTP codes', () => {
      expect(isValidOTPCode('12345')).toBe(false);
      expect(isValidOTPCode('1234567')).toBe(false);
      expect(isValidOTPCode('abc123')).toBe(false);
    });
  });

  describe('hasValidTokens', () => {
    it('should return true when both tokens are present', () => {
      expect(hasValidTokens({
        access_token: 'token1',
        refresh_token: 'token2'
      } as any)).toBe(true);
    });

    it('should return false when tokens are missing', () => {
      expect(hasValidTokens({} as any)).toBe(false);
      expect(hasValidTokens({ access_token: 'token1' } as any)).toBe(false);
      expect(hasValidTokens({ refresh_token: 'token2' } as any)).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should extract error messages correctly', () => {
      expect(getErrorMessage('Simple error')).toBe('Simple error');
      expect(getErrorMessage({ message: 'Object error' })).toBe('Object error');
      expect(getErrorMessage({ data: { message: 'Nested error' } })).toBe('Nested error');
      expect(getErrorMessage(null, 'Default')).toBe('Default');
    });
  });

  describe('isNetworkError', () => {
    it('should detect network errors', () => {
      expect(isNetworkError({ code: 'NETWORK_ERROR' })).toBe(true);
      expect(isNetworkError({ message: 'Network Error occurred' })).toBe(true);
      expect(isNetworkError({ message: 'Request timeout' })).toBe(true);
      expect(isNetworkError({ message: 'fetch failed' })).toBe(true);
    });

    it('should not detect non-network errors', () => {
      expect(isNetworkError({ message: 'Validation error' })).toBe(false);
      expect(isNetworkError({})).toBe(false);
      expect(isNetworkError(null)).toBe(false);
      expect(isNetworkError(undefined)).toBe(false);
    });
  });

  describe('getResendDelayMessage', () => {
    it('should format delay messages correctly', () => {
      expect(getResendDelayMessage(0)).toBe('Resend OTP');
      expect(getResendDelayMessage(30)).toBe('Resend in 30s');
      expect(getResendDelayMessage(90)).toBe('Resend in 1:30');
      expect(getResendDelayMessage(125)).toBe('Resend in 2:05');
    });
  });

  describe('AUTH_CONSTANTS', () => {
    it('should have correct constant values', () => {
      expect(AUTH_CONSTANTS.OTP_LENGTH).toBe(6);
      expect(AUTH_CONSTANTS.MIN_PASSWORD_LENGTH).toBe(6);
      expect(AUTH_CONSTANTS.PHONE_MIN_LENGTH).toBe(9);
      expect(AUTH_CONSTANTS.PHONE_MAX_LENGTH).toBe(10);
      expect(AUTH_CONSTANTS.OTP_RESEND_DELAY).toBe(60);
    });
  });

  describe('AUTH_MESSAGES', () => {
    it('should have all required messages', () => {
      expect(AUTH_MESSAGES.PHONE_REQUIRED).toBeDefined();
      expect(AUTH_MESSAGES.PHONE_INVALID).toBeDefined();
      expect(AUTH_MESSAGES.PASSWORD_REQUIRED).toBeDefined();
      expect(AUTH_MESSAGES.PASSWORD_TOO_SHORT).toBeDefined();
      expect(AUTH_MESSAGES.OTP_REQUIRED).toBeDefined();
      expect(AUTH_MESSAGES.OTP_INVALID).toBeDefined();
    });
  });
});
