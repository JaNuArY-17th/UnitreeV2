import { useQuery } from '@tanstack/react-query';
import { storeService } from '../services/storeService';
import type { BankMyDataResponse } from '../types';

export const useBankData = () => {
  return useQuery({
    queryKey: ['bankData', 'store'],
    queryFn: async (): Promise<BankMyDataResponse> => {
      return await storeService.getMyBankData();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
  });
};

export const useBankId = () => {
  const { data } = useBankData();
  return (data as BankMyDataResponse)?.data?.id || '';
};