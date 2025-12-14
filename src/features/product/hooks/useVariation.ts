/**
 * useVariation Hook
 * React Query hook for fetching single variation details
 */

import { useQuery } from '@tanstack/react-query';
import { variationService } from '../services/variationService';
import { VARIATION_QUERY_KEYS } from './useVariations';

/**
 * Hook to get single variation by ID
 * @param productId - Product ID (required)
 * @param variationId - Variation ID (required)
 * @param options - React Query options
 */
export const useVariation = (
  productId: string | undefined,
  variationId: string | undefined,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) => {
  return useQuery({
    queryKey: VARIATION_QUERY_KEYS.detail(
      productId || '',
      variationId || ''
    ),
    queryFn: async () => {
      if (!productId) {
        throw new Error('Product ID is required');
      }
      if (!variationId) {
        throw new Error('Variation ID is required');
      }
      return await variationService.getVariationById(productId, variationId);
    },
    enabled: !!productId && !!variationId && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

