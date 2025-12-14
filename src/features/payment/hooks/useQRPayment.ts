import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QRService } from '../services/QRServive';
import type { GenerateQRRequest, QRApiResponse } from '../types/transfer';
import type { QRPaymentData } from '../types';
import { useCallback, useState } from 'react';
import { useUserData } from '@/features/profile/hooks/useUserData';
import { useStoreData } from '@/features/authentication/hooks/useStoreData';


// API Response type for QR generation


// Query keys for QR payment operations
export const QR_QUERY_KEYS = {
  payment: ['qr', 'payment'] as const,
  generateQR: (bankType?: string) => ['qr', 'generate', bankType] as const,
};

/**
 * Hook for generating QR payment codes
 */
export const useGenerateQR = () => {
  return useMutation<QRApiResponse, Error, GenerateQRRequest>({
    mutationFn: async (data: GenerateQRRequest): Promise<QRApiResponse> => {
      console.log('🚀 [QR] Generating QR code...');
      const response = await QRService.generatePaymentQR(data);

      // Type guard to ensure response structure
      if (typeof response !== 'object' || response === null) {
        throw new Error('Invalid response format');
      }

      const typedResponse = response as QRApiResponse;

      if (!typedResponse.success) {
        console.error('❌ [QR] Generate QR failed:', typedResponse.message);
        // Create error with status code for retry logic
        const error = new Error(typedResponse.message || 'Failed to generate QR code') as Error & { status?: number };
        error.status = typedResponse.code;
        throw error;
      }
      console.log('✅ [QR] QR code generated successfully');
      return typedResponse;
    },
    // Don't retry on 404 (no bank account) or 4xx client errors
    retry: (failureCount, error) => {
      const status = (error as Error & { status?: number })?.status;
      // Don't retry on client errors (4xx), only on server errors or network issues
      if (status && status >= 400 && status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
  });
};

/**
 * Hook for managing QR payment data with auto-refresh functionality
 */
export const useQRPayment = (initialData?: Partial<GenerateQRRequest>) => {
  const [qrData, setQrData] = useState<QRPaymentData | null>(null);
  const [countdown, setCountdown] = useState<number>(38);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState<boolean>(false); // Disabled by default
  const [isGeneratingInternal, setIsGeneratingInternal] = useState<boolean>(false);

  const queryClient = useQueryClient();

  // Check if account is a store account
  const { data: userData } = useUserData();
  const { storeData } = useStoreData();
  const isStoreAccount = userData?.account_type === 'STORE' || (!!storeData && userData?.is_shop === true);

  const generateQRMutation = useGenerateQR();

  // Generate QR code
  const generateQR = useCallback(async (data?: GenerateQRRequest) => {
    // Prevent multiple simultaneous calls
    if (isGeneratingInternal || generateQRMutation.isPending) {
      console.log('🔄 [QR] Generation already in progress, skipping...');
      return;
    }

    setIsGeneratingInternal(true);
    try {
      let response: QRApiResponse;

      // Use store QR API for store accounts, regular API for user accounts
      if (isStoreAccount) {
        console.log('🏪 [QR] Generating store QR code...');
        response = await QRService.generateStoreQR();
      } else {
        // Set default values: amount = 0, description = undefined
        const requestData = {
          amount: 0,
          description: undefined,
          ...initialData,
          ...data
        };
        console.log('📝 [QR] Request data:', requestData);
        response = await generateQRMutation.mutateAsync(requestData);
      }

      console.log('✅ [QR] API Response:', {
        hasQrCode: !!response.data.qrCode,
        hasQrDataURL: !!response.data.qrDataURL,
        qrDataURLLength: response.data.qrDataURL?.length || 0
      });
      setQrData({
        qrCode: response.data.qrCode,
        qrDataURL: response.data.qrDataURL, // Store base64 image data
        autoUpdateInterval: 38, // Default 38 seconds
      });
      setCountdown(38);
      return response;
    } catch (error) {
      console.error('❌ [QR] Failed to generate QR:', error);
      throw error;
    } finally {
      setIsGeneratingInternal(false);
    }
  }, [generateQRMutation.mutateAsync, generateQRMutation.isPending, initialData, isGeneratingInternal, isStoreAccount]);

  // Refresh QR code - stable function that doesn't depend on generateQR
  const refreshQR = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isGeneratingInternal || generateQRMutation.isPending) {
      console.log('🔄 [QR] Refresh already in progress, skipping...');
      return;
    }

    setIsGeneratingInternal(true);
    try {
      let response: QRApiResponse;

      // Use store QR API for store accounts, regular API for user accounts
      if (isStoreAccount) {
        console.log('🏪 [QR] Refreshing store QR code...');
        response = await QRService.generateStoreQR();
      } else {
        // Set default values: amount = 0, description = undefined
        const requestData = {
          amount: 0,
          description: undefined,
          ...initialData
        };
        console.log('🔄 [QR] Refresh request data:', requestData);
        response = await generateQRMutation.mutateAsync(requestData);
      }

      console.log('✅ [QR] Refresh Response:', {
        hasQrCode: !!response.data.qrCode,
        hasQrDataURL: !!response.data.qrDataURL,
        qrDataURLLength: response.data.qrDataURL?.length || 0
      });
      setQrData({
        qrCode: response.data.qrCode,
        qrDataURL: response.data.qrDataURL, // Store base64 image data
        autoUpdateInterval: 38,
      });
      setCountdown(38);
      return response;
    } catch (error) {
      console.error('❌ [QR] Failed to refresh QR:', error);
      throw error;
    } finally {
      setIsGeneratingInternal(false);
    }
  }, [generateQRMutation.mutateAsync, generateQRMutation.isPending, initialData, isGeneratingInternal, isStoreAccount]);

  // Manual countdown management
  const updateCountdown = useCallback((newCountdown: number) => {
    setCountdown(newCountdown);
  }, []);

  // Toggle auto-refresh
  const toggleAutoRefresh = useCallback((enabled: boolean) => {
    setIsAutoRefreshEnabled(enabled);
  }, []);

  // Reset QR data
  const resetQR = useCallback(() => {
    setQrData(null);
    setCountdown(38);
    queryClient.removeQueries({ queryKey: QR_QUERY_KEYS.payment });
  }, [queryClient]);

  return {
    // Data
    qrData,
    countdown,
    isAutoRefreshEnabled,

    // Loading states
    isGenerating: generateQRMutation.isPending || isGeneratingInternal,
    isError: generateQRMutation.isError,
    error: generateQRMutation.error,

    // Actions
    generateQR,
    refreshQR,
    updateCountdown,
    toggleAutoRefresh,
    resetQR,

    // Mutation object for additional control
    generateQRMutation,
  };
};

/**
 * Hook for QR payment operations with simpler interface
 */
export const useQRPaymentSimple = () => {
  const generateQRMutation = useGenerateQR();

  // Wrapper function that applies default values
  const generateQRWithDefaults = useCallback((data?: GenerateQRRequest) => {
    const requestData = {
      amount: 0,
      description: undefined,
      ...data
    };
    console.log('📝 [QR Simple] Request data:', requestData);
    return generateQRMutation.mutate(requestData);
  }, [generateQRMutation.mutate]);

  const generateQRAsyncWithDefaults = useCallback(async (data?: GenerateQRRequest) => {
    const requestData = {
      amount: 0,
      description: undefined,
      ...data
    };
    console.log('📝 [QR Simple Async] Request data:', requestData);
    return generateQRMutation.mutateAsync(requestData);
  }, [generateQRMutation.mutateAsync]);

  return {
    generateQR: generateQRWithDefaults,
    generateQRAsync: generateQRAsyncWithDefaults,
    isLoading: generateQRMutation.isPending,
    isError: generateQRMutation.isError,
    error: generateQRMutation.error,
    data: generateQRMutation.data,
    reset: generateQRMutation.reset,
  };
};
