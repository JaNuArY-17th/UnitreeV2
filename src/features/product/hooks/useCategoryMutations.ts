/**
 * useCategoryMutations Hook
 * React Query mutations for category CRUD operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/categoryService';
import { CATEGORY_QUERY_KEYS } from './useCategories';
import { PRODUCT_QUERY_KEYS } from './useProducts';
import type {
  CategoryCreateRequest,
  CategoryUpdateRequest,
} from '../types/category';

/**
 * Hook to create a new category
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CategoryCreateRequest) => {
      return await categoryService.createCategory(data);
    },
    onSuccess: () => {
      // Invalidate categories list to refetch
      queryClient.invalidateQueries({
        queryKey: CATEGORY_QUERY_KEYS.lists(),
      });
    },
    retry: false, // Don't retry mutations to prevent duplicate creations
  });
};

/**
 * Hook to update a category
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryId,
      data,
    }: {
      categoryId: string;
      data: CategoryUpdateRequest;
    }) => {
      return await categoryService.updateCategory(categoryId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate specific category detail
      queryClient.invalidateQueries({
        queryKey: CATEGORY_QUERY_KEYS.detail(variables.categoryId),
      });
      // Also invalidate categories list
      queryClient.invalidateQueries({
        queryKey: CATEGORY_QUERY_KEYS.lists(),
      });
      // Invalidate products list as they may reference category names
      queryClient.invalidateQueries({
        queryKey: PRODUCT_QUERY_KEYS.lists(),
      });
    },
    retry: false,
  });
};

/**
 * Hook to delete a category
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      return await categoryService.deleteCategory(categoryId);
    },
    onSuccess: (_, categoryId) => {
      // Remove category from cache
      queryClient.removeQueries({
        queryKey: CATEGORY_QUERY_KEYS.detail(categoryId),
      });
      // Invalidate categories list
      queryClient.invalidateQueries({
        queryKey: CATEGORY_QUERY_KEYS.lists(),
      });
      // Invalidate products list as they may reference this category
      queryClient.invalidateQueries({
        queryKey: PRODUCT_QUERY_KEYS.lists(),
      });
    },
    retry: false,
  });
};

/**
 * Combined hook for all category mutations
 */
export const useCategoryMutations = () => {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    // Convenience flags
    isCreating: createCategory.isPending,
    isUpdating: updateCategory.isPending,
    isDeleting: deleteCategory.isPending,
    isMutating:
      createCategory.isPending ||
      updateCategory.isPending ||
      deleteCategory.isPending,
  };
};

