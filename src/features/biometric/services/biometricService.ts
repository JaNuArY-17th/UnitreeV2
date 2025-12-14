import ReactNativeBiometrics, { BiometryType } from 'react-native-biometrics';
import { apiClient } from '@/shared/utils/axios';
import { API_ENDPOINTS } from '@/shared/config';
import type {
  BiometricStatusResponse,
  BiometricStatusApiResponse,
  DeviceBiometricStatus,
  BiometricEnrollRequest,
  BiometricEnrollResponse,
  BiometricRemoveRequest,
  BiometricRemoveResponse,
  BiometricLoginRequest,
  BiometricLoginResponse,
  BiometricKeys,
  BiometricPromptConfig,
} from '../types/biometric';

// API endpoints
const BIOMETRIC_ENDPOINTS = {
  CHECK: API_ENDPOINTS.BIOMETRIC.CHECK,
  ENROLL: API_ENDPOINTS.BIOMETRIC.ENROLL,
  REMOVE: API_ENDPOINTS.BIOMETRIC.REMOVE,
  LOGIN: API_ENDPOINTS.BIOMETRIC.LOGIN,
  LOGIN_STORE: API_ENDPOINTS.BIOMETRIC.LOGIN_STORE,
} as const;

/**
 * Biometric Service
 * Handles biometric authentication operations
 */
export class BiometricService {
  private static instance: BiometricService;
  private rnBiometrics: ReactNativeBiometrics;

  private constructor() {
    this.rnBiometrics = new ReactNativeBiometrics();
  }

  static getInstance(): BiometricService {
    if (!BiometricService.instance) {
      BiometricService.instance = new BiometricService();
    }
    return BiometricService.instance;
  }

  /**
   * Check biometric availability and enrollment status (device-level)
   */
  async checkBiometricStatus(): Promise<DeviceBiometricStatus> {
    try {
      const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();

      if (!available) {
        return {
          is_available: false,
          is_enrolled: false,
        };
      }

      // Check if keys exist (indicates enrollment)
      const { keysExist } = await this.rnBiometrics.biometricKeysExist();

      let biometricType: DeviceBiometricStatus['biometric_type'];
      switch (biometryType) {
        case 'TouchID':
          biometricType = 'TouchID';
          break;
        case 'FaceID':
          biometricType = 'FaceID';
          break;
        case 'Biometrics':
          biometricType = 'Biometric';
          break;
        default:
          biometricType = 'Fingerprint';
      }

      return {
        is_available: true,
        is_enrolled: keysExist,
        biometric_type: biometricType,
      };
    } catch (error) {
      console.error('Biometric status check failed:', error);
      return {
        is_available: false,
        is_enrolled: false,
      };
    }
  }

  /**
   * Generate biometric keys for enrollment
   */
  async generateBiometricKeys(): Promise<BiometricKeys | null> {
    try {
      const { publicKey } = await this.rnBiometrics.createKeys();
      return { publicKey, privateKey: '' }; // Private key is stored securely by the OS
    } catch (error) {
      console.error('Failed to generate biometric keys:', error);
      return null;
    }
  }

  /**
   * Create biometric signature for authentication
   */
  async createBiometricSignature(payload: string, promptConfig?: BiometricPromptConfig): Promise<string | null> {
    try {
      const result = await this.rnBiometrics.createSignature({
        promptMessage: promptConfig?.promptMessage || 'Authenticate to continue',
        payload,
        cancelButtonText: promptConfig?.cancelButtonText || 'Cancel',
      });

      if (result.success && result.signature) {
        return result.signature;
      }
      return null;
    } catch (error) {
      console.error('Failed to create biometric signature:', error);
      return null;
    }
  }

  /**
   * Simple biometric authentication (without payload)
   */
  async authenticateBiometric(promptConfig?: BiometricPromptConfig): Promise<boolean> {
    try {
      const result = await this.rnBiometrics.simplePrompt({
        promptMessage: promptConfig?.promptMessage || 'Authenticate to continue',
        cancelButtonText: promptConfig?.cancelButtonText || 'Cancel',
        fallbackPromptMessage: promptConfig?.fallbackPromptMessage,
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  /**
   * Check biometric status via API (server-level)
   * API returns: { success: true, data: { status: boolean }, message, code }
   */
  async checkBiometricStatusAPI(): Promise<{ is_enrolled: boolean }> {
    try {
      const response = await apiClient.get<BiometricStatusApiResponse>(BIOMETRIC_ENDPOINTS.CHECK);
      const apiData = response.data;
      
      return {
        is_enrolled: apiData?.data?.status === true,
      };
    } catch (error: any) {
      console.error('Failed to check biometric status from API:', error);
      throw {
        success: false,
        message: error.message || 'Failed to check biometric status',
        errors: error.errors,
      };
    }
  }

  /**
   * Enroll biometric authentication
   */
  async enrollBiometric(data: BiometricEnrollRequest): Promise<BiometricEnrollResponse> {
    try {
      const response = await apiClient.patch<BiometricEnrollResponse>(
        BIOMETRIC_ENDPOINTS.ENROLL,
        data
      );
      return response.data || {
        success: false,
        message: 'Enrollment failed',
      };
    } catch (error: any) {
      throw {
        success: false,
        message: error.message || 'Failed to enroll biometric',
        errors: error.errors,
      };
    }
  }

  /**
   * Remove biometric authentication
   */
  async removeBiometric(data: BiometricRemoveRequest): Promise<BiometricRemoveResponse> {
    try {
      const response = await apiClient.patch<BiometricRemoveResponse>(
        BIOMETRIC_ENDPOINTS.REMOVE,
        data
      );
      return response.data || {
        success: false,
        message: 'Removal failed',
      };
    } catch (error: any) {
      throw {
        success: false,
        message: error.message || 'Failed to remove biometric',
        errors: error.errors,
      };
    }
  }

  /**
   * Login with biometric
   * Supports both user and store login with appropriate endpoints
   */
  async loginWithBiometric(data: BiometricLoginRequest): Promise<BiometricLoginResponse> {
    try {
      // Determine endpoint based on user type
      const endpoint = data.user_type === 'store' 
        ? BIOMETRIC_ENDPOINTS.LOGIN_STORE 
        : BIOMETRIC_ENDPOINTS.LOGIN;
      
      // Remove user_type from request payload as it's not needed for API
      const { user_type, ...requestData } = data;
      
      const response = await apiClient.post<BiometricLoginResponse>(
        endpoint,
        requestData
      );

      // Store tokens after successful login
      const apiResponse = response.data as any;
      if (response.success && apiResponse && apiResponse.data && apiResponse.data.access_token) {
        await apiClient.setAuthTokens(
          apiResponse.data.access_token,
          apiResponse.data.refresh_token
        );

        // Trigger auth state update
        const { authGuard } = await import('@/shared/services/authGuard');
        authGuard.triggerAuthUpdate();
      }

      return response.data || {
        access_token: '',
        refresh_token: '',
        user: { id: 0, phone_number: '' },
      };
    } catch (error: any) {
      throw {
        success: false,
        message: error.message || 'Biometric login failed',
        errors: error.errors,
      };
    }
  }

  /**
   * Delete biometric keys from device
   */
  async deleteBiometricKeys(): Promise<boolean> {
    try {
      const { keysDeleted } = await this.rnBiometrics.deleteKeys();
      return keysDeleted;
    } catch (error) {
      console.error('Failed to delete biometric keys:', error);
      return false;
    }
  }
}

// Export singleton instance
export const biometricService = BiometricService.getInstance();
