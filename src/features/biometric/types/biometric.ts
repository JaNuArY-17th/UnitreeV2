/**
 * Biometric authentication types
 */

// Device-level biometric status (from react-native-biometrics)
export interface DeviceBiometricStatus {
  is_available: boolean;
  is_enrolled: boolean;
  biometric_type?: 'TouchID' | 'FaceID' | 'Biometric' | 'Fingerprint';
}

// Server API response for biometric status: {success, data: {status}, message, code}
export interface BiometricStatusApiResponse {
  success: boolean;
  data: {
    status: boolean; // true = enrolled on server
  };
  message?: string;
  code?: number;
}

// Parsed biometric status
export interface BiometricStatusResponse {
  is_available: boolean;
  is_enrolled: boolean;
  biometric_type?: 'TouchID' | 'FaceID' | 'Biometric' | 'Fingerprint';
}

export interface BiometricEnrollRequest {
  old_password: string;
  biometric_key: string;
}

export interface BiometricEnrollResponse {
  success: boolean;
  message?: string;
}

export interface BiometricRemoveRequest {
  old_password: string;
}

export interface BiometricRemoveResponse {
  success: boolean;
  message?: string;
}

export interface BiometricLoginRequest {
  phone_number: string;
  payload: string;
  signature: string;
  user_type?: 'user' | 'store'; // Determine which endpoint to use
}

export interface BiometricLoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    phone_number: string;
    email?: string;
    full_name?: string;
  };
}

export interface BiometricKeys {
  publicKey: string;
  privateKey: string;
}

export interface BiometricPromptConfig {
  promptMessage: string;
  cancelButtonText?: string;
  fallbackPromptMessage?: string;
}
