import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { userProfileQueryKeys } from './useUserProfile';
import type { LoginRequest, LoginResponse, AuthApiResponse } from '../types/auth';

export type UserType = 'user';

interface TabLoginResult {
  data?: LoginResponse;
  isNewDevice?: boolean;
  accessToken?: string;
  refreshToken?: string;
  isVerified?: boolean;
}

interface UseTabLoginReturn {
  /**
   * Execute login based on user type
   * @param credentials - Login credentials (phone_number, password)
   * @param userType - Type of user: 'store' or 'user'
   */
  login: (credentials: LoginRequest, userType: UserType) => Promise<TabLoginResult>;

  /**
   * Loading state for the login operation
   */
  isLoading: boolean;

  /**
   * Error from the last login attempt
   */
  error: Error | null;

  /**
   * Clear any existing error
   */
  clearError: () => void;

  /**
   * Current user type being used for login
   */
  currentUserType: UserType | null;
}

/**
 * Custom hook for handling tab-based login functionality
 * Uses loginStore for store tab and login for user tab
 */
export const useTabLogin = (): UseTabLoginReturn => {
  const [currentUserType, setCurrentUserType] = useState<UserType | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  // Helper function to handle post-login data fetching
  const handlePostLoginDataFetch = async (result: TabLoginResult, userType: UserType) => {
    // Only fetch data if we have an access token (successful login without OTP)
    if (!result.accessToken) {
      console.log('ℹ️ [TabLogin] Skipping post-login data fetch - no access token (OTP required)');
      return;
    }

    try {
      console.log('🔄 [TabLogin] Fetching user data to cache after successful login...');
      const myDataResponse = await userService.getMyData();

      if (myDataResponse.success && myDataResponse.data) {
        // Cache the my-data response in React Query
        console.log('✅ [TabLogin] Caching user data in React Query for future use');
        queryClient.setQueryData(userProfileQueryKeys.myData(), myDataResponse.data);
        console.log('📊 [TabLogin] User data cached successfully - subsequent calls will use cache');
      } else {
        console.warn('⚠️ [TabLogin] User data API returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ [TabLogin] Failed to fetch user data after login:', error);
      // Don't throw error - login was successful, data fetch is optional
    }
  };

  // Mutation for handling login requests
  const loginMutation = useMutation({
    mutationFn: async ({ credentials, userType }: { credentials: LoginRequest; userType: UserType }): Promise<TabLoginResult> => {
      console.log(`🔐 [TabLogin] Starting login for:`, credentials.phone_number);

      // Use the user login method
      console.log('👤 [TabLogin] Using login method');
      const response = await authService.login(credentials);

      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }

      // Extract relevant data from response
      // Response structure: response.data -> { data: { access_token, refresh_token, is_new_device } }
      const responseData = response.data as any;
      const nestedData = responseData?.data;

      console.log('🔍 [TabLogin] Login response:', {
        success: response.success,
        hasData: !!response.data,
        message: response.message,
        dataKeys: response.data ? Object.keys(response.data) : 'no data',
        nestedDataKeys: nestedData ? Object.keys(nestedData) : 'no nested data'
      });
      const result: TabLoginResult = {
        data: response.data,
        isNewDevice: nestedData?.is_new_device,
        accessToken: nestedData?.access_token,
        refreshToken: nestedData?.refresh_token,
        isVerified: nestedData?.is_verified,
      };

      console.log('✅ [TabLogin] Login result:', {
        hasAccessToken: !!result.accessToken,
        isNewDevice: result.isNewDevice,
        isVerified: result.isVerified,
        userType
      });

      return result;
    },
    onError: (error: Error) => {
      console.error('❌ [TabLogin] Login error:', error.message);
      setError(error);
    },
    onSuccess: async (result, variables) => {
      console.log(`✅ [TabLogin] Login successful`);
      setError(null); // Clear any previous errors

      // Fetch and cache user data after successful login
      await handlePostLoginDataFetch(result, variables.userType);
    },
  });

  // Main login function
  const login = useCallback(
    async (credentials: LoginRequest, userType: UserType): Promise<TabLoginResult> => {
      setCurrentUserType(userType);
      setError(null); // Clear previous errors

      try {
        const result = await loginMutation.mutateAsync({ credentials, userType });
        return result;
      } catch (error) {
        // Error is already handled in onError, just re-throw
        throw error;
      }
    },
    [loginMutation]
  );

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
    loginMutation.reset(); // Also reset mutation state
  }, [loginMutation]);

  return {
    login,
    isLoading: loginMutation.isPending,
    error: error || (loginMutation.error as Error | null),
    clearError,
    currentUserType,
  };
};
