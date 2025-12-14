import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ekycApiService } from '../services/ekycApiService';
import { EKYC_QUERY_KEYS } from '../utils/constants';
import type { SaveEkycInfoRequest, SaveEkycInfoResponse } from '../services/ekycApiService';

// Query keys for eKYC API operations
export const ekycApiQueryKeys = {
  all: ['ekycApi'] as const,
  token: () => [...ekycApiQueryKeys.all, 'token'] as const,
  saveInfo: () => [...ekycApiQueryKeys.all, 'saveInfo'] as const,
} as const;

/**
 * Hook for eKYC token management
 * Handles getting and caching eKYC tokens
 */
export const useEkycToken = () => {
  const queryClient = useQueryClient();

  // Get eKYC token query - always fetch fresh data
  const tokenQuery = useQuery({
    queryKey: ekycApiQueryKeys.token(),
    queryFn: () => ekycApiService.getEkycToken(),
    staleTime: 0, // Always consider data stale - fetch fresh data
    gcTime: 0, // Don't cache data (formerly cacheTime)
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
    retry: (failureCount, error: any) => {
      // Don't retry if unauthorized or forbidden
      if (error?.code === 'UNAUTHORIZED' || error?.code === 'FORBIDDEN') {
        return false;
      }
      // Retry up to 2 times for network errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Get fresh token function - always fetch new data
  const getToken = useCallback(async (): Promise<string> => {
    // Always fetch fresh token, don't use cache
    const token = await queryClient.fetchQuery({
      queryKey: ekycApiQueryKeys.token(),
      queryFn: () => ekycApiService.getEkycToken(),
      staleTime: 0, // Always consider stale
    });

    return token;
  }, [queryClient]);

  // Invalidate token (useful when token expires)
  const invalidateToken = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ekycApiQueryKeys.token() });
  }, [queryClient]);

  // Remove token from cache
  const clearToken = useCallback(() => {
    queryClient.removeQueries({ queryKey: ekycApiQueryKeys.token() });
  }, [queryClient]);

  return {
    // Query state
    token: tokenQuery.data,
    isLoading: tokenQuery.isLoading,
    isError: tokenQuery.isError,
    error: tokenQuery.error,
    isSuccess: tokenQuery.isSuccess,
    
    // Actions
    getToken,
    invalidateToken,
    clearToken,
    refetch: tokenQuery.refetch,
  };
};

/**
 * Hook for saving eKYC information
 * Handles the API call to save eKYC data to server
 */
export const useEkycSave = () => {
  const queryClient = useQueryClient();

  // Save eKYC info mutation
  const saveInfoMutation = useMutation({
    mutationFn: (data: SaveEkycInfoRequest) => ekycApiService.saveEkycInfo(data),
    onSuccess: (response, _variables) => {
      console.log('✅ eKYC info saved successfully:', response);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: EKYC_QUERY_KEYS.all });

      // You can add additional success handling here
      // For example, updating user profile cache if eKYC affects user status
    },
    onError: (error, _variables) => {
      console.error('❌ Failed to save eKYC info:', error);

      // You can add additional error handling here
      // For example, showing specific error messages based on error type
    },
    retry: (failureCount, error: any) => {
      // Don't retry if unauthorized, forbidden, or validation error
      if (
        error?.code === 'UNAUTHORIZED' || 
        error?.code === 'FORBIDDEN' || 
        error?.code === 'VALIDATION_ERROR'
      ) {
        return false;
      }
      // Retry up to 1 time for network errors
      return failureCount < 1;
    },
    retryDelay: 2000, // 2 seconds delay before retry
  });

  // Save eKYC info function
  const saveEkycInfo = useCallback(
    async (data: SaveEkycInfoRequest): Promise<SaveEkycInfoResponse> => {
      return saveInfoMutation.mutateAsync(data);
    },
    [saveInfoMutation]
  );

  return {
    // Mutation state
    isLoading: saveInfoMutation.isPending,
    isError: saveInfoMutation.isError,
    isSuccess: saveInfoMutation.isSuccess,
    error: saveInfoMutation.error,
    data: saveInfoMutation.data,
    
    // Actions
    saveEkycInfo,
    reset: saveInfoMutation.reset,
  };
};

/**
 * Combined hook for eKYC API operations
 * Provides both token and save functionality
 */
export const useEkycApi = () => {
  const tokenHook = useEkycToken();
  const saveHook = useEkycSave();

  // Combined save function that automatically gets token if needed
  const saveWithToken = useCallback(
    async (data: SaveEkycInfoRequest): Promise<SaveEkycInfoResponse> => {
      // Ensure we have a valid token before saving
      try {
        await tokenHook.getToken();
      } catch (tokenError) {
        console.error('Failed to get eKYC token before saving:', tokenError);
        throw tokenError;
      }

      // Proceed with saving
      return saveHook.saveEkycInfo(data);
    },
    [tokenHook, saveHook]
  );

  return {
    // Token operations
    token: tokenHook.token,
    getToken: tokenHook.getToken,
    invalidateToken: tokenHook.invalidateToken,
    clearToken: tokenHook.clearToken,
    
    // Save operations
    saveEkycInfo: saveHook.saveEkycInfo,
    saveWithToken,
    
    // Combined state
    isLoadingToken: tokenHook.isLoading,
    isLoadingSave: saveHook.isLoading,
    isLoading: tokenHook.isLoading || saveHook.isLoading,
    
    tokenError: tokenHook.error,
    saveError: saveHook.error,
    
    isTokenSuccess: tokenHook.isSuccess,
    isSaveSuccess: saveHook.isSuccess,
    
    // Reset functions
    resetSave: saveHook.reset,
  };
};

/**
 * Hook for eKYC API status and utilities
 * Provides helper functions and status checks
 */
export const useEkycApiStatus = () => {
  const queryClient = useQueryClient();

  // Check if token is cached and valid
  const hasValidToken = useCallback((): boolean => {
    const tokenData = queryClient.getQueryState(ekycApiQueryKeys.token());
    return !!(tokenData?.data && tokenData.status === 'success');
  }, [queryClient]);

  // Clear all eKYC API cache
  const clearAllCache = useCallback(() => {
    queryClient.removeQueries({ queryKey: ekycApiQueryKeys.all });
  }, [queryClient]);

  // Invalidate all eKYC API queries
  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ekycApiQueryKeys.all });
  }, [queryClient]);

  return {
    hasValidToken,
    clearAllCache,
    invalidateAll,
  };
};
