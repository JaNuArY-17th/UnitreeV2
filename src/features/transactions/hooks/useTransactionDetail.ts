import { useQuery } from '@tanstack/react-query';
import { transactionService } from '../services/transactionService';
import type { BankType } from '../types';

export const TRANSACTION_DETAIL_KEY = (id: string) => ['transaction', 'detail', id] as const;


import { bankTypeManager } from '@/features/deposit/utils/bankTypeManager';
import { useState, useEffect } from 'react';

export const useTransactionDetail = (id?: string, bankType?: BankType) => {
  const [resolvedBankType, setResolvedBankType] = useState<BankType | undefined>(bankType);
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!bankType) {
        const loaded = await bankTypeManager.getBankType();
        if (mounted) setResolvedBankType(loaded || 'USER');
      } else {
        setResolvedBankType(bankType);
      }
    })();
    return () => { mounted = false; };
  }, [bankType]);
  return useQuery({
    queryKey: id ? TRANSACTION_DETAIL_KEY(id) : ['transaction', 'detail', '_'],
    enabled: !!id && !!resolvedBankType,
    queryFn: () => transactionService.getTransactionDetails(id as string, resolvedBankType),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 mins
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache for 30 mins
    refetchOnMount: false, // Don't refetch if cached data exists
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
  });
};

// Legacy export for backward compatibility
export const useBankTransactionDetail = useTransactionDetail;
export const BANK_TXN_DETAIL_KEY = TRANSACTION_DETAIL_KEY;
