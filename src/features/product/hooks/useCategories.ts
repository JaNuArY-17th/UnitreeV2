/**
 * useCategories Hook
 * React Query hook for fetching and managing categories list
 */

import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/categoryService';
import type { CategoryListParams } from '../types/category';

/**
 * Query keys for categories
 */
export const CATEGORY_QUERY_KEYS = {
  all: ['categories'] as const,
  lists: () => [...CATEGORY_QUERY_KEYS.all, 'list'] as const,
  list: (params?: CategoryListParams) =>
    [...CATEGORY_QUERY_KEYS.lists(), params] as const,
  details: () => [...CATEGORY_QUERY_KEYS.all, 'detail'] as const,
  detail: (categoryId: string) =>
    [...CATEGORY_QUERY_KEYS.details(), categoryId] as const,
} as const;

/**
 * Hook to get categories list with pagination
 * @param params - Query parameters (page, size, searchTerm)
 * @param options - React Query options
 */
export const useCategories = (
  params?: CategoryListParams,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchOnMount?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.list(params),
    queryFn: async () => {
      return await categoryService.getCategories(params);
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 10 * 60 * 1000, // 10 minutes (categories change less frequently)
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

