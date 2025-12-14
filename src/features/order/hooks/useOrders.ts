/**
 * useOrders Hook
 * React Query hook for fetching and managing orders list
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import type { OrderListParams } from '../types/order';

/**
 * Query keys for orders
 */
export const ORDER_QUERY_KEYS = {
  all: ['orders'] as const,
  lists: () => [...ORDER_QUERY_KEYS.all, 'list'] as const,
  list: (params?: OrderListParams) =>
    [...ORDER_QUERY_KEYS.lists(), params?.orderSequence, params?.size] as const,
  details: () => [...ORDER_QUERY_KEYS.all, 'detail'] as const,
  detail: (orderId: string) =>
    [...ORDER_QUERY_KEYS.details(), orderId] as const,
} as const;

/**
 * Hook to get orders list with pagination and search
 * @param params - Query parameters (size, orderSequence for search)
 * @param options - React Query options
 */
export const useOrders = (
  params?: OrderListParams,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchOnMount?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) => {
  return useInfiniteQuery({
    queryKey: ORDER_QUERY_KEYS.list(params),
    queryFn: async ({ pageParam = 0 }) => {
      return await orderService.getOrders({
        page: pageParam,
        size: params?.size || 20,
        orderSequence: params?.orderSequence,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      // Assuming API returns all data in pages, check if we got a full page
      const currentPageSize = lastPage.data?.length || 0;
      const requestedSize = params?.size || 20;
      return currentPageSize === requestedSize ? allPages.length : undefined;
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    refetchOnMount: options?.refetchOnMount ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 or 403
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
    initialPageParam: 0,
  });
};
