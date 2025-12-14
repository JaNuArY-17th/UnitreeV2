import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { storeService } from '../services/storeService';
import { userProfileQueryKeys } from './useUserProfile';
import { STORE_QUERY_KEYS, setPersistedHasStore } from './useStoreData';
import { bankService } from '@/features/deposit/services/bankService';
import { bankTypeManager } from '@/features/deposit/utils/bankTypeManager';
import { BANK_TYPE_QUERY_KEY } from '@/features/deposit/hooks/useBankTypeManager';
import { updateColorsForAccountType } from '@/shared/themes/colors';
import type { LoginRequest, LoginResponse, AuthApiResponse } from '../types/auth';
import type { StoreMyDataResponse } from '../types/store';

export type UserType = 'store' | 'user';

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

        // Intelligent bank type determination using login tab + is_shop field
        const userIsShop = myDataResponse.data.is_shop;
        const accountType = myDataResponse.data.account_type;

        // Priority logic:
        // 1. Use login tab preference if it matches user capabilities
        // 2. Fallback to is_shop field if tab preference conflicts
        // 3. Final fallback to account_type
        let finalBankType: 'STORE' | 'USER' | undefined;

        if (userType === 'store' && userIsShop) {
          // User selected store tab and is eligible (is_shop = true)
          finalBankType = 'STORE';
          console.log('🏪 [TabLogin] Bank type: STORE (tab preference + is_shop = true)');
        } else if (userType === 'store' && !userIsShop) {
          // User selected store tab but not eligible (is_shop = false) - fallback to USER
          finalBankType = 'USER';
          console.log('👤 [TabLogin] Bank type: USER (store tab selected but is_shop = false, fallback)');
        } else if (userType === 'user') {
          // User selected user tab - respect their choice
          finalBankType = 'USER';
          console.log('👤 [TabLogin] Bank type: USER (user tab selected)');
        } else {
          // Fallback to is_shop field or account_type
          if (userIsShop) {
            finalBankType = 'STORE';
            console.log('🏪 [TabLogin] Bank type: STORE (fallback to is_shop = true)');
          } else if (accountType === 'STORE') {
            finalBankType = 'STORE';
            console.log('🏪 [TabLogin] Bank type: STORE (fallback to account_type)');
          } else if (accountType === 'USER') {
            finalBankType = 'USER';
            console.log('👤 [TabLogin] Bank type: USER (fallback to account_type)');
          } else {
            console.log('⚠️ [TabLogin] Bank type could not be determined from API data');
          }
        }

        if (finalBankType) {
          bankTypeManager.setBankType(finalBankType as any);
          queryClient.setQueryData(BANK_TYPE_QUERY_KEY, finalBankType);
          console.log(`🏦 [TabLogin] Final bank type set: ${finalBankType}`, {
            loginTab: userType,
            isShop: userIsShop,
            accountType: accountType
          });

          // Invalidate any cached bank data with wrong bank type to prevent inconsistencies
          try {
            const wrongBankType = finalBankType === 'STORE' ? 'USER' : 'STORE';
            queryClient.removeQueries({ queryKey: ['bank', 'account', wrongBankType] });
            console.log(`🗑️ [TabLogin] Removed cached data for incorrect bank type: ${wrongBankType}`);
          } catch (invalidateError) {
            console.warn('⚠️ [TabLogin] Could not invalidate wrong bank type cache:', invalidateError);
          }

          // Try to cache bank account data based on determined bank type
          try {
            console.log(`🏦 [TabLogin] Attempting to fetch and cache bank account data for ${finalBankType} type...`);
            const bankAccountResponse = await bankService.getMyBankAccount({ bankType: finalBankType });

            if (bankAccountResponse.success && bankAccountResponse.data) {
              console.log('✅ [TabLogin] Bank account data fetched and will be cached by React Query');

              // Also try to fetch linked banks using the same bank type
              try {
                await bankService.getLinkedBanks({ bankType: finalBankType });
                console.log('✅ [TabLogin] Linked banks data fetched successfully');
              } catch (linkedError) {
                console.warn('❌ [TabLogin] Unable to fetch linked banks:', linkedError);
              }
            } else {
              console.warn('⚠️ [TabLogin] Bank account API returned unsuccessful response');
            }
          } catch (bankError) {
            console.warn('❌ [TabLogin] Unable to fetch bank account data:', bankError);
          }
        } else {
          console.warn('⚠️ [TabLogin] Bank type could not be determined, skipping bank data fetch');
        }

        // Fetch and cache store data if user actually has a store (based on API response)
        const shouldFetchStoreData = userIsShop || accountType === 'STORE';
        if (shouldFetchStoreData) {
          try {
            console.log('🔄 [TabLogin] User has store (is_shop=true or account_type=STORE), fetching store data to cache...');

            const storeResponse = await storeService.getStoreData();
            console.log('📦 [TabLogin] Store API response:', {
              success: storeResponse.success,
              message: storeResponse.message,
              hasData: !!storeResponse.data,
              code: storeResponse.code
            });

            if (storeResponse.success) {
              // Cache the store data response in React Query
              queryClient.setQueryData(STORE_QUERY_KEYS.storeData(), storeResponse);
              // Persist hasStore = true to AsyncStorage
              await setPersistedHasStore(true);
              // Invalidate the hasStoreFromStorage query to pick up the new value
              queryClient.invalidateQueries({ queryKey: ['store', 'hasStoreFromStorage'] });
              console.log('✅ [TabLogin] Store data cached successfully - hasStore = true');
            } else {
              // Cache the unsuccessful response so hasStore will be false
              queryClient.setQueryData(STORE_QUERY_KEYS.storeData(), storeResponse);
              // Persist hasStore = false to AsyncStorage
              await setPersistedHasStore(false);
              // Invalidate the hasStoreFromStorage query to pick up the new value
              queryClient.invalidateQueries({ queryKey: ['store', 'hasStoreFromStorage'] });
              console.log('ℹ️ [TabLogin] Store API returned success: false - hasStore = false');
            }
          } catch (storeError) {
            console.warn('❌ [TabLogin] Failed to fetch store data:', storeError);
            // Cache a failed response so hasStore will be false
            try {
              const failedResponse: StoreMyDataResponse = {
                success: false,
                message: 'Failed to fetch store data',
                data: {} as any,
                code: 0
              };
              queryClient.setQueryData(STORE_QUERY_KEYS.storeData(), failedResponse);
              // Persist hasStore = false to AsyncStorage
              await setPersistedHasStore(false);
              // Invalidate the hasStoreFromStorage query to pick up the new value
              queryClient.invalidateQueries({ queryKey: ['store', 'hasStoreFromStorage'] });
            } catch (cacheError) {
              console.warn('❌ [TabLogin] Could not cache failed store response:', cacheError);
            }
          }
        } else {
          console.log('ℹ️ [TabLogin] User does not have store (is_shop=false and account_type!=STORE), skipping store data fetch');
          // Ensure hasStore is set to false for non-store users
          await setPersistedHasStore(false);
          // Invalidate the hasStoreFromStorage query to pick up the new value
          queryClient.invalidateQueries({ queryKey: ['store', 'hasStoreFromStorage'] });
        }
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
      console.log(`🔐 [TabLogin] Starting ${userType} login for:`, credentials.phone_number);

      let response: AuthApiResponse<LoginResponse>;

      // Choose the appropriate login method based on user type
      if (userType === 'store') {
        console.log('🏪 [TabLogin] Using loginStore method');
        response = await authService.loginStore(credentials);
      } else {
        console.log('👤 [TabLogin] Using login method');
        response = await authService.login(credentials);
      }

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
      console.log(`✅ [TabLogin] ${variables.userType} login successful`);
      setError(null); // Clear any previous errors

      // CRITICAL: Set preliminary bank type immediately based on login tab selection
      // This prevents race conditions with UI components that use bank data
      // NOTE: This is a temporary value that will be corrected by API data in handlePostLoginDataFetch
      const preliminaryBankType = variables.userType === 'store' ? 'STORE' : 'USER';
      bankTypeManager.setBankType(preliminaryBankType as any);
      queryClient.setQueryData(BANK_TYPE_QUERY_KEY, preliminaryBankType);
      console.log(`🏦 [TabLogin] Preliminary bank type set to ${preliminaryBankType} based on login selection (will be corrected by API data)`);

      // Update colors immediately based on selected user type
      updateColorsForAccountType(preliminaryBankType);
      console.log(`🎨 [TabLogin] Colors updated to ${preliminaryBankType} based on login selection`);

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
