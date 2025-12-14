import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo, useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';
import { bankTypeManager } from '@/features/deposit/utils/bankTypeManager';
import type {
  TransactionHistoryParams,
  BankType,
  TransactionTypeFilter,
  TransactionDateFilter
} from '../types';

interface UseTransactionsOptions {
  typeFilter?: TransactionTypeFilter;
  transactionTypeFilter?: string; // Additional transaction type like 'CREDIT'
  dateFilter?: TransactionDateFilter;
  bankType?: BankType;
  limit?: number;
  enabled?: boolean;
}

const mapTypeFilter = (f: TransactionTypeFilter | undefined): TransactionHistoryParams['type'] => {
  switch (f) {
    case 'deposit': return 'MONEY_IN';
    case 'withdraw': return 'MONEY_OUT';
    default: return 'ALL';
  }
};

const mapTransactionTypeFilter = (f: TransactionTypeFilter | undefined): string | undefined => {
  switch (f) {
    case 'credit': return 'CREDIT';
    default: return undefined;
  }
};

function buildDateRange(dateFilter: TransactionDateFilter | undefined) {
  if (!dateFilter || dateFilter === 'all') return { fromDate: undefined, toDate: undefined };
  const now = new Date();
  let start: Date;
  if (dateFilter === 'today') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (dateFilter === '7d') {
    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else { // 30d
    start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  return { fromDate: start.toISOString(), toDate: now.toISOString() };
}

export const useTransactions = (opts: UseTransactionsOptions = {}) => {
  const {
    typeFilter = 'all',
    transactionTypeFilter,
    dateFilter = 'all',
    bankType,
    limit = 20,
    enabled = true,
  } = opts;

  // Use provided bankType or get from manager (async)
  const [effectiveBankType, setEffectiveBankType] = useState<BankType | undefined>(bankType);
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!bankType) {
        const loaded = await bankTypeManager.getBankType();
        if (mounted) setEffectiveBankType(loaded || 'USER');
      } else {
        setEffectiveBankType(bankType);
      }
    })();
    return () => { mounted = false; };
  }, [bankType]);

  const { fromDate, toDate } = buildDateRange(dateFilter);

  const queryKey = useMemo(() => ['transaction', 'list', effectiveBankType, typeFilter, transactionTypeFilter, dateFilter, limit, fromDate || '', toDate || ''] as const, [effectiveBankType, typeFilter, transactionTypeFilter, dateFilter, limit, fromDate, toDate]);

  return useInfiniteQuery<{ success: boolean; message: string; data: { transactions: any[]; totalItems: number; totalPages: number; currentPage: number }; code: number }, Error, any, typeof queryKey, number>({
    queryKey,
    enabled: enabled && !!effectiveBankType,
    initialPageParam: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Stale-while-revalidate: show cached data but refetch in background when stale
    refetchOnMount: true, // Refetch on mount if stale (shows cached first)
    getNextPageParam: (lastPage) => {
      // Handle case where lastPage or lastPage.data is undefined
      if (!lastPage?.data) {
        return undefined;
      }
      const { totalPages, currentPage } = lastPage.data;
      // Ensure currentPage and totalPages are valid numbers
      if (typeof currentPage !== 'number' || typeof totalPages !== 'number') {
        return undefined;
      }
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    queryFn: async ({ pageParam }) => {
      const params: Partial<TransactionHistoryParams> = {
        page: pageParam as number,
        limit,
        bankType: effectiveBankType,
        type: mapTypeFilter(typeFilter),
        transactionType: transactionTypeFilter || mapTransactionTypeFilter(typeFilter),
        fromDate,
        toDate,
      };
      return transactionService.getTransactions(params);
    },
    staleTime: 30 * 1000, // 30 seconds - data is fresh for 30 seconds
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache
    retry: 1,
    // Keep previous data while new query loads to avoid flicker & duplicate calls
    placeholderData: (prev) => prev,
    structuralSharing: false,
  });
};

export type UseTransactionsResult = ReturnType<typeof useTransactions>;

// Legacy exports for backward compatibility
export const useBankTransactions = useTransactions;
export type BankTxnTypeFilter = TransactionTypeFilter;
export type BankTxnDateFilter = TransactionDateFilter;
export type UseBankTransactionsOptions = UseTransactionsOptions;
export type UseBankTransactionsResult = UseTransactionsResult;
