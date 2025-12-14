import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/useRedux';
import { ekycService } from '../services/ekycService';
import {
  initializeEkycAsync,
  startEkycCaptureAsync,
  retryEkycCaptureAsync,
  resetEkyc,
  clearError,
  setCurrentStep,
} from '../store/ekycSlice';
import {
  selectCurrentStep,
  selectIsProcessing,
  selectIsInitialized,
  selectEkycResults,
  selectEkycError,
  selectRetryCount,
  selectSessionId,
  selectCanRetry,
  selectIsSuccess,
  selectIsError,
  selectEkycStatus,
  selectEkycSummary,
  selectNavigationData,
} from '../store/ekycSelectors';
import type { EkycType, UseEkycReturn } from '../types/ekyc';
import { EKYC_QUERY_KEYS } from '../utils/constants';

/**
 * Main eKYC hook
 * Combines Redux state management with React Query for API calls
 * Similar to useAuth pattern
 */
export const useEkyc = (): UseEkycReturn => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  // Redux selectors
  const currentStep = useAppSelector(selectCurrentStep);
  const isProcessing = useAppSelector(selectIsProcessing);
  const isInitialized = useAppSelector(selectIsInitialized);
  const results = useAppSelector(selectEkycResults);
  const error = useAppSelector(selectEkycError);
  const retryCount = useAppSelector(selectRetryCount);
  const sessionId = useAppSelector(selectSessionId);
  const canRetry = useAppSelector(selectCanRetry);
  const isSuccess = useAppSelector(selectIsSuccess);
  const isError = useAppSelector(selectIsError);

  // Initialize eKYC
  const initializeEkyc = useCallback(async () => {
    return await dispatch(initializeEkycAsync()).unwrap();
  }, [dispatch]);

  // Start eKYC capture
  const startCapture = useCallback(async (type: EkycType) => {
    // Ensure eKYC is initialized
    if (!isInitialized) {
      await initializeEkyc();
    }

    const result = await dispatch(startEkycCaptureAsync({ type })).unwrap();

    // Invalidate related queries
    queryClient.invalidateQueries({ queryKey: EKYC_QUERY_KEYS.all });

    return result.result;
  }, [dispatch, isInitialized, initializeEkyc, queryClient]);

  // Retry eKYC capture
  const retryCapture = useCallback(async () => {
    if (!canRetry) {
      throw new Error('Maximum retry attempts reached');
    }

    const result = await dispatch(retryEkycCaptureAsync()).unwrap();

    // Invalidate related queries
    queryClient.invalidateQueries({ queryKey: EKYC_QUERY_KEYS.all });

    return result.result;
  }, [dispatch, canRetry, queryClient]);

  // Reset eKYC state
  const resetEkycState = useCallback(() => {
    dispatch(resetEkyc());

    // Clear related queries
    queryClient.removeQueries({ queryKey: EKYC_QUERY_KEYS.all });
  }, [dispatch, queryClient]);

  // Clear error
  const clearEkycError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Set current step manually (for UI control)
  const setStep = useCallback((step: typeof currentStep) => {
    dispatch(setCurrentStep(step));
  }, [dispatch]);

  // Check if SDK is available
  const checkAvailability = useCallback(() => {
    return ekycService.isAvailable();
  }, []);

  // Get eKYC summary for display
  const summary = useAppSelector(selectEkycSummary);
  const navigationData = useAppSelector(selectNavigationData);

  return {
    // State
    currentStep,
    isProcessing,
    isInitialized,
    results,
    error,
    retryCount,
    sessionId,

    // Computed state
    canRetry,
    isSuccess,
    isError,

    // Actions
    initializeEkyc,
    startCapture,
    retryCapture,
    resetEkyc: resetEkycState,
    clearError: clearEkycError,
    setStep,

    // Utils
    checkAvailability,
    summary,
    navigationData,
  };
};

/**
 * Hook for eKYC availability check
 * Useful for conditional rendering
 */
export const useEkycAvailability = () => {
  const isAvailable = useCallback(() => {
    return ekycService.isAvailable();
  }, []);

  return {
    isAvailable: isAvailable(),
    checkAvailability: isAvailable,
  };
};

/**
 * Hook for eKYC session management
 * Handles session lifecycle
 */
export const useEkycSession = () => {
  const dispatch = useAppDispatch();
  const sessionId = useAppSelector(selectSessionId);
  const isInitialized = useAppSelector(selectIsInitialized);

  const startSession = useCallback(async () => {
    if (!isInitialized) {
      return await dispatch(initializeEkycAsync()).unwrap();
    }
    return { sessionId };
  }, [dispatch, isInitialized, sessionId]);

  const endSession = useCallback(() => {
    dispatch(resetEkyc());
  }, [dispatch]);

  return {
    sessionId,
    isInitialized,
    startSession,
    endSession,
  };
};

/**
 * Hook for eKYC status monitoring
 * Provides detailed status information
 */
export const useEkycStatus = () => {
  const status = useAppSelector(selectEkycStatus);
  const summary = useAppSelector(selectEkycSummary);

  return {
    ...status,
    summary,
    // Helper methods
    isIdle: status.isIdle,
    isCapturing: status.isCapturing,
    isCompleted: status.isCompleted,
    hasError: status.hasError,
  };
};

/**
 * Hook for eKYC results management
 * Handles result processing and validation
 */
export const useEkycResults = () => {
  const results = useAppSelector(selectEkycResults);
  const navigationData = useAppSelector(selectNavigationData);
  const summary = useAppSelector(selectEkycSummary);

  const hasResults = useCallback(() => {
    return !!results;
  }, [results]);

  const hasValidResults = useCallback(() => {
    return summary.validationStatus.isValid;
  }, [summary]);

  const getNavigationParams = useCallback(() => {
    return navigationData;
  }, [navigationData]);

  return {
    results,
    navigationData,
    hasResults: hasResults(),
    hasValidResults: hasValidResults(),
    getNavigationParams,
    validationStatus: summary.validationStatus,
  };
};
