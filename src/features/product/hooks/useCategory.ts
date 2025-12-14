/**
 * useCategory Hook
 * React Query hook for fetching single category details
 */

import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/categoryService';
import { CATEGORY_QUERY_KEYS } from './useCategories';

/**
 * Hook to get category by ID
 * @param categoryId - Category ID (required)
 * @param options - React Query options
 */
export const useCategory = (
  categoryId: string | undefined,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchOnMount?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.detail(categoryId || ''),
    queryFn: async () => {
      if (!categoryId) {
        throw new Error('Category ID is required');
      }
      return await categoryService.getCategoryById(categoryId);
    },
    enabled: !!categoryId && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 10 * 60 * 1000, // 10 minutes
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

