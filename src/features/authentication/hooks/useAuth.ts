import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/useRedux';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import {
  loginAsync,
  logoutAsync,
  getCurrentUserAsync,
  initializeAuthAsync,
  clearError,
} from '../store/authSlice';
import {
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
  selectAuthStatus,
  selectUserInfo,
  selectRefreshToken,
} from '../store/authSelectors';
import { userProfileQueryKeys } from './useUserProfile';
import { isOTPRequired } from '../utils/authUtils';
import type { LoginRequest, RegisterRequest } from '../types/auth';
import { tokenManager } from '@/shared/utils/tokenManager';
import { storeService } from '../services/storeService';
import { STORE_QUERY_KEYS, setPersistedHasStore } from './useStoreData';
import type { StoreMyDataResponse } from '../types/store';

// Query keys
export const authQueryKeys = {
  all: ['auth'] as const,
  user: () => [...authQueryKeys.all, 'user'] as const,
  profile: () => [...authQueryKeys.all, 'profile'] as const,
} as const;

/**
 * Main authentication hook
 * Combines Redux state management with React Query for API calls
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  // Get Redux state at hook level (not inside mutation functions)
  const refreshToken = useAppSelector(selectRefreshToken);

  // Redux selectors
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectAuthError);
  const authStatus = useAppSelector(selectAuthStatus);
  const userInfo = useAppSelector(selectUserInfo);

  // Initialize auth state on app start
  const initializeAuth = useCallback(async () => {
    return dispatch(initializeAuthAsync()).unwrap();
  }, [dispatch]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => dispatch(loginAsync(credentials)).unwrap(),
    retry: false, // Disable retry for login to prevent multiple API calls
    onSuccess: async (data) => {
      // Type assertion to handle the actual API response structure
      const responseData = data as any;

      console.log('🎉 [Login] Login mutation onSuccess called with data:', {
        hasAccessToken: !!(responseData?.access_token || responseData?.data?.access_token),
        message: responseData?.message,
        otpRequired: isOTPRequired(responseData),
        dataStructure: Object.keys(responseData || {})
      });

      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
      queryClient.setQueryData(authQueryKeys.user(), responseData.user);

      // Check for access token in both possible locations
      const accessToken = responseData?.access_token || responseData?.data?.access_token;

      // Immediately fetch my-data after successful login (when no OTP required)
      if (responseData && accessToken && !isOTPRequired(responseData)) {
        try {
          console.log('🔄 [PostLogin] Fetching user data to cache via React Query (deduped)...');

          // Use React Query's fetchQuery to dedupe with any in-flight user queries
          const myDataResponse = await queryClient.fetchQuery(
            userProfileQueryKeys.myData(),
            async () => {
              const resp = await userService.getMyData();
              return resp;
            }
          );

          if (myDataResponse && myDataResponse.success && myDataResponse.data) {
            // Cache the my-data response in React Query (ensure raw data stored)
            console.log('✅ [PostLogin] Caching user data in React Query for future use');
            queryClient.setQueryData(userProfileQueryKeys.myData(), myDataResponse.data);
            console.log('📊 [PostLogin] User data cached successfully - subsequent calls will use cache');

            // Fetch and cache my-postpaid data
            // NOTE: Account feature has been removed, skipping postpaid data fetch
            console.log('ℹ️ [PostLogin] Account feature unavailable, skipping postpaid data fetch');

            // Check if we should fetch store data
            const userAccountType = myDataResponse.data?.account_type || (myDataResponse.data?.is_shop ? 'STORE' : 'USER');
            const shouldFetchStoreData = myDataResponse.data?.is_shop || myDataResponse.data?.account_type === 'STORE';
            console.log('🔍 [PostLogin] Checking for store data fetch:', {
              accountType: myDataResponse.data?.account_type,
              isShop: myDataResponse.data?.is_shop,
              derivedAccountType: userAccountType,
              shouldFetchStore: shouldFetchStoreData
            });

            // Ensure persisted hasStore flag reflects actual user role
            if (!shouldFetchStoreData) {
              try {
                await setPersistedHasStore(false);
                // Cache a failed/empty store response so consumers don't trigger store dashboard
                const failedResponse = { success: false, message: 'No store for this user', data: null, code: 404 };
                queryClient.setQueryData(STORE_QUERY_KEYS.storeData(), failedResponse);
              } catch (e) {
                console.warn('Failed to clear persisted hasStore flag:', e);
              }
            }

            // Fetch and cache store data if user actually has a store (based on API response)
            if (shouldFetchStoreData) {
              console.log('🔄 [PostLogin] User has store (is_shop=true or account_type=STORE), fetching store data to cache...', {
                accountType: myDataResponse.data?.account_type,
                userId: myDataResponse.data?.id
              });
              try {
                const storeResponse = await storeService.getStoreData();
                console.log('📦 [PostLogin] Store API response:', {
                  success: storeResponse.success,
                  message: storeResponse.message,
                  hasData: !!storeResponse.data,
                  code: storeResponse.code
                });

                if (storeResponse.success) {
                  // Cache the store data response in React Query
                  queryClient.setQueryData(STORE_QUERY_KEYS.storeData(), storeResponse);
                  console.log('✅ [PostLogin] Store data cached successfully - hasStore = true');
                } else {
                  // Cache the unsuccessful response so hasStore will be false
                  queryClient.setQueryData(STORE_QUERY_KEYS.storeData(), storeResponse);
                  console.log('ℹ️ [PostLogin] Store API returned success: false - hasStore = false');
                }
              } catch (storeError) {
                console.warn('❌ [PostLogin] Failed to fetch store data:', storeError);
                // Cache a failed response so hasStore will be false
                const failedResponse: StoreMyDataResponse = {
                  success: false,
                  message: 'Failed to fetch store data',
                  data: {} as any, // Empty data for failed response
                  code: 0
                };
                queryClient.setQueryData(STORE_QUERY_KEYS.storeData(), failedResponse);
                // Don't throw error - store fetch is optional
              }
            } else {
              console.log('ℹ️ [PostLogin] User type is not STORE, skipping store data fetch', {
                accountType: myDataResponse.data?.account_type
              });
            }

            // Note: Bank flow is now handled by useTabLogin hook to avoid duplicate calls
            // The useTabLogin hook provides intelligent bank type selection based on login tab and user data
            console.log('📝 [PostLogin] Bank flow is handled by useTabLogin - skipping duplicate bank operations');
          } else {
            console.warn('⚠️ [PostLogin] User data API returned unsuccessful response');
          }
        } catch (error) {
          console.error('❌ [PostLogin] Failed to fetch my-data after login:', error);
          // Don't throw error - login was successful, my-data fetch is optional
        }
      } else {
        console.log('ℹ️ [PostLogin] Skipping user data fetch - conditions not met:', {
          hasData: !!responseData,
          hasAccessToken: !!accessToken,
          otpRequired: isOTPRequired(responseData)
        });
      }
    },
    onError: (loginError) => {
      console.error('Login failed:', loginError);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterRequest) => {
      const response = await authService.register(userData);
      return response.data;
    },
    retry: false, // Disable retry for registration to prevent multiple API calls
    onSuccess: async (data) => {
      // Type assertion to handle the actual API response structure
      const responseData = data as any;

      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
      if (responseData?.user) {
        queryClient.setQueryData(authQueryKeys.user(), responseData.user);
      }

      // Check for access token in both possible locations
      const accessToken = responseData?.access_token || responseData?.data?.access_token;

      // Immediately fetch my-data after successful registration (when no OTP required)
      if (responseData && accessToken && !isOTPRequired(responseData)) {
        try {
          console.log('🔄 [PostRegister] Fetching user data to cache...');
          const myDataResponse = await userService.getMyData();

          if (myDataResponse.success && myDataResponse.data) {
            // Cache the my-data response in React Query
            console.log('✅ [PostRegister] Caching user data in React Query for future use');
            queryClient.setQueryData(userProfileQueryKeys.myData(), myDataResponse.data);
            console.log('📊 [PostRegister] User data cached successfully - subsequent calls will use cache');

            // Fetch and cache my-postpaid data
            // NOTE: Account feature has been removed, skipping postpaid data fetch
            console.log('ℹ️ [PostRegister] Account feature unavailable, skipping postpaid data fetch');

            // Note: Bank flow is now handled by useTabLogin hook to avoid duplicate calls
            // The useTabLogin hook provides intelligent bank type selection based on login tab and user data
            console.log('📝 [PostRegister] Bank flow is handled by useTabLogin - skipping duplicate bank operations');
          } else {
            console.warn('⚠️ [PostRegister] User data API returned unsuccessful response');
          }
        } catch (error) {
          console.error('❌ [PostRegister] Failed to fetch my-data after registration:', error);
          // Don't throw error - registration was successful, my-data fetch is optional
        }
      }
    },
    onError: (registerError) => {
      console.error('Registration failed:', registerError);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log('🔄 Starting logout process...');

      // Clear Redux state (this will also call the logout API)
      console.log('🔄 Clearing Redux auth state...');
      await dispatch(logoutAsync()).unwrap();

      // Clear local tokens
      console.log('🔄 Clearing local tokens...');
      await tokenManager.clearTokens();

      // DON'T clear cached login data - we want to keep it for RememberLogin screen
      // The user can re-login quickly from RememberLogin screen

      // Import and trigger authGuard logout for navigation
      console.log('🔄 Triggering navigation...');
      const { authGuard } = await import('@/shared/services/authGuard');
      // Use the public logout method which will emit login-required
      setTimeout(() => {
        authGuard.logout().catch(console.error);
      }, 100);
    },
    onSuccess: () => {
      // Clear all cached data including my-data
      queryClient.clear();
    },
    onError: async (logoutError) => {
      console.error('Logout failed:', logoutError);
      // Even if logout fails, clear everything and trigger navigation
      queryClient.clear();
      try {
        tokenManager.clearTokens();
        const { authGuard } = await import('@/shared/services/authGuard');
        setTimeout(() => {
          authGuard.logout().catch(console.error);
        }, 100);
      } catch (error) {
        console.error('Cleanup after logout error failed:', error);
      }
    },
  });

  // Get current user query
  const userQuery = useQuery({
    queryKey: authQueryKeys.user(),
    queryFn: () => dispatch(getCurrentUserAsync()).unwrap(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, queryError: any) => {
      // Don't retry if unauthorized
      if (queryError?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Actions
  const login = useCallback(
    (credentials: LoginRequest) => {
      return loginMutation.mutateAsync(credentials);
    },
    [loginMutation]
  );

  const register = useCallback(
    (userData: RegisterRequest) => {
      return registerMutation.mutateAsync(userData);
    },
    [registerMutation]
  );

  const logout = useCallback(() => {
    return logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const refreshUser = useCallback(() => {
    if (isAuthenticated) {
      return queryClient.invalidateQueries({ queryKey: authQueryKeys.user() });
    }
  }, [queryClient, isAuthenticated]);

  // Check if user is authenticated and has valid token
  const isValidSession = useCallback(() => {
    return isAuthenticated && authService.isAuthenticated();
  }, [isAuthenticated]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    error,
    authStatus,
    userInfo,

    // Query states
    isUserLoading: userQuery.isLoading,
    userError: userQuery.error,

    // Actions
    login,
    register,
    logout,
    clearAuthError,
    refreshUser,
    initializeAuth,

    // Utilities
    isValidSession,

    // Mutation states
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    logoutError: logoutMutation.error,
  };
};
