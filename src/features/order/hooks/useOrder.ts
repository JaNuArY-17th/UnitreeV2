/**
 * useOrder Hook
 * React Query hook for fetching a single order by ID
 */

import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import { ORDER_QUERY_KEYS } from './useOrders';

/**
 * Hook to get order by ID
 * @param orderId - Order ID (required)
 * @param options - React Query options
 */
export const useOrder = (
  orderId: string | undefined,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchOnMount?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) => {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.detail(orderId || ''),
    queryFn: async () => {
      if (!orderId) {
        throw new Error('Order ID is required');
      }
      return await orderService.getOrderById(orderId);
    },
    enabled: !!orderId && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache
    refetchOnMount: options?.refetchOnMount ?? false,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnReconnect: false, // Don't refetch on reconnect
    retry: (failureCount, error: any) => {
      // Don't retry on 404 or 403
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
};
