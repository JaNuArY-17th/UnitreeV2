import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { bioService } from '../services/bioService';
import type { CheckBioResponse, EnrollRequest } from '../types';

// Query Keys
export const BIOMETRIC_QUERY_KEY = ['biometric-status'];

/**
 * Hook to check biometric status for current device (cached via react-query)
 */
export const useBiometricStatus = () => {
  const query = useQuery<CheckBioResponse['data']>({
    queryKey: BIOMETRIC_QUERY_KEY,
    queryFn: async () => {
      const res = await bioService.checkBio();
      return res.data; // { status: boolean }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Expose derived status flag (status boolean) distinct from react-query's status string
  return {
    ...query,
    biometricEnabled: query.data?.status ?? false,
  };
};

/**
 * Generate / ensure device biometric key pair.
 * Returns publicKey to send to backend for enrollment. Private key remains in Secure Enclave / Keystore.
 */
export const generateBiometricKeyPair = async (): Promise<{ publicKey: string; biometryType: BiometryTypes | null }> => {
  const rnBiometrics = new ReactNativeBiometrics();
  const { available, biometryType } = await rnBiometrics.isSensorAvailable();
  if (!available) {
    throw new Error('Biometric sensor not available');
  }

  // Delete existing to rotate
  await rnBiometrics.deleteKeys();
  const { publicKey } = await rnBiometrics.createKeys();
  return { publicKey, biometryType: biometryType ?? null };
};

/**
 * Hook for enrolling biometric: generates key pair then calls API
 */
export const useEnrollBiometric = () => {
  const qc = useQueryClient();
  return useMutation({
    // Expect an object containing the user's current password
    mutationFn: async (payload: { old_password: string }) => {
      if (!payload?.old_password) {
        throw new Error('Current password is required');
      }
      const { publicKey } = await generateBiometricKeyPair();
      const res = await bioService.enrollBio({ old_password: payload.old_password, biometric_key: publicKey });
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BIOMETRIC_QUERY_KEY });
    },
  });
};

/**
 * Hook for removing biometric enrollment
 */
export const useRemoveBiometric = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => bioService.removeBio(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BIOMETRIC_QUERY_KEY });
    },
  });
};

/**
 * Convenience combined hook
 */
export const useBiometric = () => {
  const statusQuery = useBiometricStatus();
  const enrollMutation = useEnrollBiometric();
  const removeMutation = useRemoveBiometric();
  const [sensorAvailable, setSensorAvailable] = useState<boolean | null>(null);
  const [biometryType, setBiometryType] = useState<BiometryTypes | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const rnBiometrics = new ReactNativeBiometrics();
        const res = await rnBiometrics.isSensorAvailable();
        setSensorAvailable(res.available);
        setBiometryType(res.biometryType ?? null);
      } catch {
        setSensorAvailable(false);
      }
    })();
  }, []);

  const toggle = useCallback(async (enable: boolean, oldPassword?: string) => {
    if (enable) {
      if (!oldPassword) throw new Error('Password required to enable biometric');
      await enrollMutation.mutateAsync({ old_password: oldPassword });
    } else {
      await removeMutation.mutateAsync();
    }
  }, [enrollMutation, removeMutation]);

  return {
    ...statusQuery,
  sensorAvailable,
  biometryType,
    enroll: enrollMutation.mutateAsync,
    enrolling: enrollMutation.isPending,
    remove: removeMutation.mutateAsync,
    removing: removeMutation.isPending,
    toggle,
  };
};
