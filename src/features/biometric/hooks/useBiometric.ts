import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/useRedux';
import {
  checkBiometricStatus,
  enrollBiometric,
  removeBiometric,
  loginWithBiometric,
  resetErrors,
  clearBiometricState,
} from '../store/biometricSlice';
import { biometricService } from '../services/biometricService';
import type {
  BiometricEnrollRequest,
  BiometricRemoveRequest,
  BiometricLoginRequest,
  BiometricPromptConfig,
} from '../types/biometric';

export const useBiometric = () => {
  const dispatch = useAppDispatch();

  // Select biometric state
  const biometricState = useAppSelector((state) => state.biometric);

  /**
   * Check biometric availability and enrollment status
   */
  const checkStatus = useCallback((userId?: string) => {
    dispatch(checkBiometricStatus(userId));
  }, [dispatch]);

  /**
   * Enroll biometric authentication
   */
  const enroll = useCallback(
    async (data: BiometricEnrollRequest, userId: string) => {
      const result = await dispatch(enrollBiometric({ data, userId })).unwrap();
      return result;
    },
    [dispatch]
  );

  /**
   * Remove biometric authentication
   */
  const remove = useCallback(
    async (data: BiometricRemoveRequest, userId: string) => {
      const result = await dispatch(removeBiometric({ data, userId })).unwrap();
      return result;
    },
    [dispatch]
  );

  /**
   * Login with biometric
   */
  const login = useCallback(
    async (data: BiometricLoginRequest) => {
      const result = await dispatch(loginWithBiometric(data)).unwrap();
      return result;
    },
    [dispatch]
  );

  /**
   * Authenticate with biometric (simple prompt without payload)
   */
  const authenticate = useCallback(
    async (promptConfig?: BiometricPromptConfig): Promise<boolean> => {
      return await biometricService.authenticateBiometric(promptConfig);
    },
    []
  );

  /**
   * Create biometric signature for a payload
   */
  const createSignature = useCallback(
    async (payload: string, promptConfig?: BiometricPromptConfig): Promise<string | null> => {
      return await biometricService.createBiometricSignature(payload, promptConfig);
    },
    []
  );

  /**
   * Generate biometric keys (for enrollment)
   */
  const generateKeys = useCallback(async () => {
    return await biometricService.generateBiometricKeys();
  }, []);

  /**
   * Delete biometric keys from device
   */
  const deleteKeys = useCallback(async (): Promise<boolean> => {
    return await biometricService.deleteBiometricKeys();
  }, []);

  /**
   * Reset all errors
   */
  const resetAllErrors = useCallback(() => {
    dispatch(resetErrors());
  }, [dispatch]);

  /**
   * Clear biometric state
   */
  const clearState = useCallback(() => {
    dispatch(clearBiometricState());
  }, [dispatch]);

  return {
    // State
    ...biometricState,

    // Actions
    checkStatus,
    enroll,
    remove,
    login,
    authenticate,
    createSignature,
    generateKeys,
    deleteKeys,
    resetAllErrors,
    clearState,

    // Computed properties
    isBiometricSupported: biometricState.isAvailable,
    isBiometricEnrolled: biometricState.isEnrolled,
    isBiometricEnrolledOnServer: biometricState.isEnrolledOnServer,
    canUseBiometricLogin: biometricState.isAvailable && biometricState.isEnrolled && biometricState.isEnrolledOnServer,
  };
};
