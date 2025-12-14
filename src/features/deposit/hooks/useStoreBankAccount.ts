/**
 * Dedicated hook for current bank account data
 * Provides easy access to automatically cached bank account data after login
 * Uses current bank type from bank type manager
 */
import { useQuery } from '@tanstack/react-query';
import { bankService } from '../services/bankService';
import { BANK_QUERY_KEYS } from './useBankAccount';
import { bankTypeManager } from '../utils/bankTypeManager';
import { useBankTypeManager } from './useBankTypeManager';
import { PERSISTENT_BANK_QUERY_CONFIG } from '@/shared/config/queryClient';
import type { BankResponse } from '../types/bank';

/**
 * Hook to get current bank account data based on bank type manager
 * This data is automatically fetched and cached after successful login
 * Only executes query when bank type is available
 */
export const useStoreBankAccount = () => {
  const { currentBankType } = useBankTypeManager();

  return useQuery({
    queryKey: currentBankType ? BANK_QUERY_KEYS.account(currentBankType) : ['bank', 'account', 'disabled'],
    queryFn: () => bankService.getMyBankAccount({ bankType: currentBankType! }),
    enabled: !!currentBankType, // Only run query when bank type is available
    ...PERSISTENT_BANK_QUERY_CONFIG,
  });
};

/**
 * Helper hook to get current bank account data with computed values
 */
export const useStoreBankAccountData = () => {
  const { data, isLoading, error, isError } = useStoreBankAccount();

  return {
    // Raw response
    bankAccountResponse: data,

    // Extracted bank account data
    bankAccount: data?.data,

    // Loading states
    isLoading,
    isError,
    error,

    // Computed values for easy access
    bankNumber: data?.data?.bankNumber,
    bankHolder: data?.data?.bankHolder,
    bankBalance: data?.data?.bankBalance,
    bankCurrency: data?.data?.bankCurrency,
    bankStatus: data?.data?.bankStatus,
    bankType: data?.data?.bankType,

    // Formatted display values
    formattedBalance: data?.data?.bankBalance
      ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: data.data.bankCurrency || 'VND'
      }).format(data.data.bankBalance)
      : undefined,

    // Status checks
    isActive: data?.data?.bankStatus === 'ACTIVE',
    hasAccount: !!data?.data,
  };
};
