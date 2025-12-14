/**
 * React Query hook for bank account data
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bankService } from '../services/bankService';
import { bankTypeManager } from '../utils/bankTypeManager';
import { PERSISTENT_BANK_QUERY_CONFIG } from '@/shared/config/queryClient';
import type { BankType, QRGenerationRequest, QRGenerationParams, LinkBankRequest } from '../types/bank';

// Query keys for React Query
export const BANK_QUERY_KEYS = {
  all: ['bank'] as const,
  account: (bankType: BankType) => [...BANK_QUERY_KEYS.all, 'account', bankType] as const,
  vietqrBanks: () => [...BANK_QUERY_KEYS.all, 'vietqr-banks'] as const,
  listBanks: () => [...BANK_QUERY_KEYS.all, 'list-banks'] as const,
  selectableBanks: () => [...BANK_QUERY_KEYS.all, 'selectable-banks'] as const,
  qrGeneration: () => [...BANK_QUERY_KEYS.all, 'qr-generation'] as const,
  linkedBanks: () => [...BANK_QUERY_KEYS.all, 'linked-banks'] as const,
  checkBank: (bankType: BankType) => [...BANK_QUERY_KEYS.all, 'check-bank', bankType] as const,
  chooseBank: (bankType: BankType) => [...BANK_QUERY_KEYS.all, 'choose-bank', bankType] as const,
} as const;

/**
 * Hook to fetch user's bank account information
 * Uses current bank type from manager if not explicitly provided
 */
export const useBankAccount = (bankType?: BankType) => {
  const effectiveBankType = bankType || bankTypeManager.getBankTypeSync();

  return useQuery({
    queryKey: effectiveBankType ? BANK_QUERY_KEYS.account(effectiveBankType as BankType) : ['bank', 'account', 'disabled'],
    queryFn: async () => {
      if (!effectiveBankType) {
        throw new Error('Bank type is required');
      }
      return bankService.getMyBankAccount({ bankType: effectiveBankType as BankType });
    },
    enabled: !!effectiveBankType, // Only run query if we have a bank type
    staleTime: 30 * 1000, // 30 seconds - balance is fresh for 30 seconds
    gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep in cache longer
    refetchOnMount: true, // Stale-while-revalidate: show cached, refetch if stale
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'always', // Always refetch when network reconnects
    networkMode: 'offlineFirst', // Use cached data when offline
    retry: 3, // More retries for important bank data
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

/**
 * Hook to fetch VietQR banks list
 */
export const useVietQRBanks = () => {
  return useQuery({
    queryKey: BANK_QUERY_KEYS.vietqrBanks(),
    queryFn: () => bankService.getVietQRBanks(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - banks list doesn't change often
    gcTime: 48 * 60 * 60 * 1000, // 48 hours
    refetchOnMount: false, // Don't refetch if we have cached data
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'always', // Always refetch when network reconnects
    networkMode: 'offlineFirst', // Use cached data when offline
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook to fetch list banks (Techcombank API)
 */
export const useListBanks = () => {
  return useQuery({
    queryKey: BANK_QUERY_KEYS.listBanks(),
    queryFn: () => bankService.getBankList(),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 48 * 60 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook to generate QR code for top-up
 * Uses current bank type from manager if not provided in params
 */
export const useQRGeneration = () => {
  return useMutation({
    mutationFn: ({ request, params }: { request: QRGenerationRequest; params?: Partial<QRGenerationParams> }) =>
      bankService.generateQRTopup(request, params),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Helper hook to get bank account data with loading and error states
 * Uses current bank type from manager if not explicitly provided
 */
export const useBankAccountData = (bankType?: BankType) => {
  const { data, isLoading, error, isError } = useBankAccount(bankType);

  return {
    bankAccount: data?.data,
    isLoading,
    error,
    isError,
    hasBankData: !!data?.data,
    accountNumber: data?.data?.bankNumber,
    holderName: data?.data?.bankHolder,
    balance: data?.data?.bankBalance,
    currency: data?.data?.bankCurrency,
    status: data?.data?.bankStatus,
  };
};

/**
 * Hook to fetch user's linked banks
 * Uses current bank type from manager
 */
export const useLinkedBanks = (bankType?: BankType) => {
  const effectiveBankType = bankType || bankTypeManager.getBankTypeSync();

  return useQuery({
    queryKey: [...BANK_QUERY_KEYS.linkedBanks(), effectiveBankType],
    queryFn: async () => {
      if (!effectiveBankType) {
        throw new Error('Bank type is required');
      }
      return bankService.getLinkedBanks({ bankType: effectiveBankType as BankType });
    },
    enabled: !!effectiveBankType,
    staleTime: 15 * 60 * 1000, // 15 minutes - longer stale time for persistent data
    gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep in cache longer
    refetchOnMount: false, // Don't refetch if we have cached data
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'always', // Always refetch when network reconnects
    networkMode: 'offlineFirst', // Use cached data when offline
    retry: 3, // More retries for important bank data
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

/**
 * Hook to link a new bank account
 * Uses current bank type from manager
 */
export const useLinkBank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: LinkBankRequest) => bankService.linkBank(request),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: BANK_QUERY_KEYS.linkedBanks() });
    }
  });
};

/**
 * Hook to delete a linked bank account
 * Uses current bank type from manager if not provided
 */
export const useDeleteLinkedBank = (bankType?: BankType) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accountId: string) => bankService.deleteLinkedBank(accountId, bankType ? { bankType } : undefined),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: BANK_QUERY_KEYS.linkedBanks() });
    }
  });
};

/**
 * Hook to set a linked bank as default
 * Uses current bank type from manager if not provided
 */
export const useSetLinkedBankAsDefault = (bankType?: BankType) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accountId: string) => bankService.setLinkedBankAsDefault(accountId, bankType ? { bankType } : undefined),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: BANK_QUERY_KEYS.linkedBanks() });
    }
  });
};

/**
 * Hook to check bank status (imperative mutation for easier orchestration)
 * Uses current bank type from manager if not provided
 */
export const useCheckBank = (bankType?: BankType) => {
  const effectiveBankType = bankType || bankTypeManager.getBankTypeSync();

  return useMutation({
    mutationKey: effectiveBankType ? BANK_QUERY_KEYS.checkBank(effectiveBankType as BankType) : ['bank', 'check-bank', 'disabled'],
    mutationFn: () => bankService.checkBank(bankType ? { bankType } : undefined),
    retry: 1,
  });
};

/**
 * Hook to choose bank number for user (imperative)
 * Uses current bank type from manager if not provided
 */
export const useChooseBank = (bankType?: BankType) => {
  const effectiveBankType = bankType || bankTypeManager.getBankTypeSync();

  return useMutation({
    mutationKey: effectiveBankType ? BANK_QUERY_KEYS.chooseBank(effectiveBankType as BankType) : ['bank', 'choose-bank', 'disabled'],
    mutationFn: () => bankService.chooseBank(bankType ? { bankType } : undefined),
    retry: 1,
  });
};
