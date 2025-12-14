/**
 * useVariations Hook
 * React Query hook for fetching and managing variations list
 */

import { useQuery } from '@tanstack/react-query';
import { variationService } from '../services/variationService';
import type { GlobalVariationSearchParams } from '../types/variation';

/**
 * Query keys for variations
 */
export const VARIATION_QUERY_KEYS = {
  all: ['variations'] as const,
  lists: () => [...VARIATION_QUERY_KEYS.all, 'list'] as const,
  list: (productId: string) =>
    [...VARIATION_QUERY_KEYS.lists(), productId] as const,
  details: () => [...VARIATION_QUERY_KEYS.all, 'detail'] as const,
  detail: (productId: string, variationId: string) =>
    [...VARIATION_QUERY_KEYS.details(), productId, variationId] as const,
  globalSearch: (params?: GlobalVariationSearchParams) =>
    [...VARIATION_QUERY_KEYS.all, 'global-search', params] as const,
} as const;

/**
 * Hook to get variations list for a product
 * @param productId - Product ID (required)
 * @param options - React Query options
 */
export const useVariations = (
  productId: string | undefined,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchOnMount?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) => {
  return useQuery({
    queryKey: VARIATION_QUERY_KEYS.list(productId || ''),
    queryFn: async () => {
      if (!productId) {
        throw new Error('Product ID is required');
      }
      return await variationService.getVariations(productId);
    },
    enabled: !!productId && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    refetchOnMount: options?.refetchOnMount ?? false,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 or 403
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Hook to search all variations globally (across all products)
 * Used in cart/POS for product selection
 * @param params - Search parameters (name, status)
 * @param options - React Query options
 */
export const useGlobalVariations = (
  params?: GlobalVariationSearchParams,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchOnMount?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) => {
  return useQuery({
    queryKey: VARIATION_QUERY_KEYS.globalSearch(params),
    queryFn: async () => {
      return await variationService.searchGlobalVariations(params);
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 2 * 60 * 1000, // 2 minutes (shorter for real-time inventory)
    refetchOnMount: options?.refetchOnMount ?? false,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

