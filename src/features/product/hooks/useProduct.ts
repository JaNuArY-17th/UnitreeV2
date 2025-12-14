/**
 * useProduct Hook
 * React Query hook for fetching single product details
 */

import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { PRODUCT_QUERY_KEYS } from './useProducts';

/**
 * Hook to get product by ID
 * @param productId - Product ID (required)
 * @param options - React Query options
 */
export const useProduct = (
  productId: string | undefined,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchOnMount?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) => {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.detail(productId || ''),
    queryFn: async () => {
      if (!productId) {
        throw new Error('Product ID is required');
      }
      return await productService.getProductById(productId);
    },
    enabled: !!productId && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    refetchOnMount: options?.refetchOnMount ?? false,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    retry: (failureCount, error: any) => {
      // Don't retry on 404
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

