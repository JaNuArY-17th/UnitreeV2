/**
 * useProducts Hook
 * React Query hook for fetching and managing products list
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';
import type { ProductListParams } from '../types/product';

/**
 * Query keys for products
 */
export const PRODUCT_QUERY_KEYS = {
  all: ['products'] as const,
  lists: () => [...PRODUCT_QUERY_KEYS.all, 'list'] as const,
  list: (params?: ProductListParams) =>
    [...PRODUCT_QUERY_KEYS.lists(), params] as const,
  details: () => [...PRODUCT_QUERY_KEYS.all, 'detail'] as const,
  detail: (productId: string) =>
    [...PRODUCT_QUERY_KEYS.details(), productId] as const,
} as const;

/**
 * Hook to get products list with pagination
 * @param params - Query parameters (page, size, searchTerm, categoryId)
 * @param options - React Query options
 */
export const useProducts = (
  params?: ProductListParams,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchOnMount?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) => {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.list(params),
    queryFn: async () => {
      return await productService.getProducts(params);
    },
    enabled: options?.enabled ?? true,
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
 * Hook to get products list with infinite pagination and optional search/filter
 * @param params - Query parameters (searchTerm, categoryId)
 * @param options - React Query options
 */
export const useInfiniteProducts = (
  params?: { searchTerm?: string; categoryId?: string },
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchOnMount?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) => {
  return useInfiniteQuery({
    queryKey: PRODUCT_QUERY_KEYS.list({
      searchTerm: params?.searchTerm,
      categoryId: params?.categoryId,
    }),
    queryFn: async ({ pageParam }) => {
      return await productService.getProducts({
        page: pageParam,
        size: 20,
        searchTerm: params?.searchTerm,
        categoryId: params?.categoryId,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage.data;
      return pagination?.has_next ? pagination.current_page + 1 : undefined;
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    refetchOnMount: options?.refetchOnMount ?? false,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  });
};
