/**
 * useVariationMutations Hook
 * React Query mutations for variation CRUD operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { variationService } from '../services/variationService';
import { VARIATION_QUERY_KEYS } from './useVariations';
import { PRODUCT_QUERY_KEYS } from './useProducts';
import type {
  VariationCreateRequest,
  VariationUpdateRequest,
} from '../types/variation';

/**
 * Hook to create a new variation
 * @param productId - Product ID (required)
 */
export const useCreateVariation = (productId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VariationCreateRequest) => {
      if (!productId) {
        throw new Error('Product ID is required');
      }
      return await variationService.createVariation(productId, data);
    },
    onSuccess: () => {
      // Invalidate variations list to refetch
      if (productId) {
        queryClient.invalidateQueries({
          queryKey: VARIATION_QUERY_KEYS.lists(),
        });
        // Also invalidate product detail (to update has_variation status if needed)
        queryClient.invalidateQueries({
          queryKey: PRODUCT_QUERY_KEYS.detail(productId),
        });
      }
    },
    retry: false, // Don't retry mutations to prevent duplicate creations
  });
};

/**
 * Hook to update a variation
 * @param productId - Product ID (required)
 */
export const useUpdateVariation = (productId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      variationId,
      data,
    }: {
      variationId: string;
      data: VariationUpdateRequest;
    }) => {
      if (!productId) {
        throw new Error('Product ID is required');
      }
      return await variationService.updateVariation(
        productId,
        variationId,
        data
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate specific variation detail
      if (productId) {
        queryClient.invalidateQueries({
          queryKey: VARIATION_QUERY_KEYS.detail(
            productId,
            variables.variationId
          ),
        });
        // Also invalidate variations list
        queryClient.invalidateQueries({
          queryKey: VARIATION_QUERY_KEYS.lists(),
        });
      }
    },
    retry: false,
  });
};

/**
 * Hook to delete a variation
 * @param productId - Product ID (required)
 */
export const useDeleteVariation = (productId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variationId: string) => {
      if (!productId) {
        throw new Error('Product ID is required');
      }
      return await variationService.deleteVariation(productId, variationId);
    },
    onSuccess: (_, variationId) => {
      // Remove variation from cache
      if (productId) {
        queryClient.removeQueries({
          queryKey: VARIATION_QUERY_KEYS.detail(productId, variationId),
        });
        // Invalidate variations list
        queryClient.invalidateQueries({
          queryKey: VARIATION_QUERY_KEYS.lists(),
        });
      }
    },
    retry: false,
  });
};

/**
 * Combined hook for all variation mutations
 * @param productId - Product ID (required)
 */
export const useVariationMutations = (productId: string | undefined) => {
  const createVariation = useCreateVariation(productId);
  const updateVariation = useUpdateVariation(productId);
  const deleteVariation = useDeleteVariation(productId);

  return {
    createVariation,
    updateVariation,
    deleteVariation,
    // Convenience flags
    isCreating: createVariation.isPending,
    isUpdating: updateVariation.isPending,
    isDeleting: deleteVariation.isPending,
    isMutating:
      createVariation.isPending ||
      updateVariation.isPending ||
      deleteVariation.isPending,
  };
};

