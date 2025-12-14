/**
 * useProductMutations Hook
 * React Query mutations for product CRUD operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { PRODUCT_QUERY_KEYS } from './useProducts';
import type {
  ProductCreateRequest,
  ProductUpdateRequest,
} from '../types/product';

/**
 * Hook to create a new product
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProductCreateRequest) => {
      return await productService.createProduct(data);
    },
    onSuccess: () => {
      // Invalidate products list to refetch
      queryClient.invalidateQueries({
        queryKey: PRODUCT_QUERY_KEYS.lists(),
      });
    },
    retry: false, // Don't retry mutations to prevent duplicate creations
  });
};

/**
 * Hook to update a product
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      data,
    }: {
      productId: string;
      data: ProductUpdateRequest;
    }) => {
      return await productService.updateProduct(productId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate specific product detail
      queryClient.invalidateQueries({
        queryKey: PRODUCT_QUERY_KEYS.detail(variables.productId),
      });
      // Also invalidate products list
      queryClient.invalidateQueries({
        queryKey: PRODUCT_QUERY_KEYS.lists(),
      });
    },
    retry: false,
  });
};

/**
 * Hook to delete a product
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      return await productService.deleteProduct(productId);
    },
    onSuccess: (_, productId) => {
      // Remove product from cache
      queryClient.removeQueries({
        queryKey: PRODUCT_QUERY_KEYS.detail(productId),
      });
      // Invalidate products list
      queryClient.invalidateQueries({
        queryKey: PRODUCT_QUERY_KEYS.lists(),
      });
    },
    retry: false,
  });
};

/**
 * Combined hook for all product mutations
 */
export const useProductMutations = () => {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    // Convenience flags
    isCreating: createProduct.isPending,
    isUpdating: updateProduct.isPending,
    isDeleting: deleteProduct.isPending,
    isMutating:
      createProduct.isPending ||
      updateProduct.isPending ||
      deleteProduct.isPending,
  };
};

