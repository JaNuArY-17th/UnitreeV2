import { Platform } from 'react-native';

/**
 * Biometric utility functions
 */

/**
 * Check if the current platform supports biometric authentication
 */
export const isBiometricSupported = (): boolean => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

/**
 * Get the biometric type display name
 */
export const getBiometricTypeDisplayName = (
  biometricType?: 'TouchID' | 'FaceID' | 'Biometric' | 'Fingerprint'
): string => {
  switch (biometricType) {
    case 'TouchID':
      return 'Touch ID';
    case 'FaceID':
      return 'Face ID';
    case 'Biometric':
      return Platform.OS === 'android' ? 'Fingerprint' : 'Biometric';
    case 'Fingerprint':
      return 'Fingerprint';
    default:
      return 'Biometric';
  }
};

/**
 * Generate a random payload for biometric signature
 */
export const generateBiometricPayload = (): string => {
  return `biometric-login-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate biometric enrollment data
 */
export const validateBiometricEnrollData = (data: {
  old_password: string;
  biometric_key: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.old_password || data.old_password.trim().length === 0) {
    errors.push('Old password is required');
  }

  if (!data.biometric_key || data.biometric_key.trim().length === 0) {
    errors.push('Biometric key is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate biometric login data
 */
export const validateBiometricLoginData = (data: {
  phone_number: string;
  payload: string;
  signature: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.phone_number || data.phone_number.trim().length === 0) {
    errors.push('Phone number is required');
  }

  if (!data.payload || data.payload.trim().length === 0) {
    errors.push('Payload is required');
  }

  if (!data.signature || data.signature.trim().length === 0) {
    errors.push('Signature is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
