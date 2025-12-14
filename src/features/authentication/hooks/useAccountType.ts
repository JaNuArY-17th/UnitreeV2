import { useUserProfile } from './useUserProfile';

/**
 * Hook to get and cache user account type from my-data API
 * Now uses useUserProfile internally to avoid duplicate queries
 * Returns account type only from API response, no default values
 */
export const useAccountType = () => {
  const {
    userData,
    isLoading,
    error,
    refetch,
  } = useUserProfile();

  // Extract account type from user data only from API response
  // If account_type is not present, derive it from is_shop field
  const accountType: 'USER' | 'STORE' | undefined = userData?.account_type || (userData?.is_shop ? 'STORE' : 'USER');

  // Convert to bank type for backward compatibility
  const bankType: 'USER' | 'STORE' | undefined = accountType;

  return {
    accountType,
    bankType, // Alias for backward compatibility
    userData,
    isLoading,
    error,
    refetch,
  };
};

export type UseAccountTypeResult = ReturnType<typeof useAccountType>;
