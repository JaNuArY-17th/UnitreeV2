
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccountType } from '@/features/authentication/hooks/useAccountType';
import { bankTypeManager } from '../utils/bankTypeManager';

/**
 * Hook to automatically manage bank type based on user account type
 * This hook should be used at the app level to ensure bank type is always synced
 * with the current user's account type
 */

export const BANK_TYPE_QUERY_KEY = ['bankType'] as const;

export const useBankTypeManager = () => {
  const queryClient = useQueryClient();
  const { accountType, isLoading, error } = useAccountType();

  const { data: currentBankType, isFetched: hasBankType } = useQuery({
    queryKey: BANK_TYPE_QUERY_KEY,
    queryFn: async () => {
      const type = await bankTypeManager.getBankType();
      return type ?? null; // React Query doesn't allow undefined, use null instead
    },
    staleTime: Infinity, // We manage updates manually
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache
  });

  return {
    currentBankType,
    accountType,
    isLoading,
    error,
    hasBankType,
    // Utility functions
    setBankType: async (bankType: 'USER' | 'STORE') => {
      await bankTypeManager.setBankType(bankType);
      queryClient.setQueryData(BANK_TYPE_QUERY_KEY, bankType);
    },
    clearBankType: async () => {
      await bankTypeManager.clearBankType();
      queryClient.setQueryData(BANK_TYPE_QUERY_KEY, null);
    },
  };
};

export type UseBankTypeManagerResult = ReturnType<typeof useBankTypeManager>;
