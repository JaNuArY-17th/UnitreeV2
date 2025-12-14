import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountService } from '../services/accountService';
import type { RequestPostPaidResponse } from '../types/accountType';

/**
 * Query keys for account-related queries
 */
export const ACCOUNT_QUERY_KEYS = {
  POSTPAID: ['account', 'postpaid'] as const,
} as const;

/**
 * Hook to get user's postpaid information
 */
export const usePostpaidData = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.POSTPAID,
    queryFn: async () => {
      const response = await accountService.getMyPostpaid();
      return response;
    },
    enabled: options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook to request postpaid activation
 */
export const useRequestPostpaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<RequestPostPaidResponse> => {
      return await accountService.requestPostpaid();
    },
    onSuccess: () => {
      // Invalidate postpaid data to refetch updated information
      queryClient.invalidateQueries({
        queryKey: ACCOUNT_QUERY_KEYS.POSTPAID,
      });
    },
    onError: (error) => {
      console.error('Failed to request postpaid activation:', error);
    },
  });
};
