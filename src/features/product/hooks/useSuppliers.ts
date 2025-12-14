/**
 * useSuppliers Hook
 * React Query hook for fetching and managing suppliers list
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { supplierService } from '../services/supplierService';
import type { SupplierListParams } from '../types/supplier';

/**
 * Query keys for suppliers
 */
export const SUPPLIER_QUERY_KEYS = {
  all: ['suppliers'] as const,
  lists: () => [...SUPPLIER_QUERY_KEYS.all, 'list'] as const,
  list: (params?: SupplierListParams) =>
    [...SUPPLIER_QUERY_KEYS.lists(), params] as const,
  details: () => [...SUPPLIER_QUERY_KEYS.all, 'detail'] as const,
  detail: (supplierId: string) =>
    [...SUPPLIER_QUERY_KEYS.details(), supplierId] as const,
} as const;

/**
 * Hook to get suppliers list with pagination and optional search
 * @param params - Query parameters (page, size, searchTerm)
 * @param options - React Query options
 */
export const useSuppliers = (
  params?: SupplierListParams,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchOnMount?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) => {
  return useQuery({
    queryKey: SUPPLIER_QUERY_KEYS.list(params),
    queryFn: async () => {
      return await supplierService.getSuppliers(params);
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
 * Hook to get suppliers list with infinite pagination and optional search
 * @param params - Query parameters (searchTerm)
 * @param options - React Query options
 */
export const useInfiniteSuppliers = (
  params?: { searchTerm?: string },
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchOnMount?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) => {
  return useInfiniteQuery({
    queryKey: SUPPLIER_QUERY_KEYS.list({ searchTerm: params?.searchTerm }),
    queryFn: async ({ pageParam }) => {
      return await supplierService.getSuppliers({
        page: pageParam,
        size: 20,
        searchTerm: params?.searchTerm,
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

