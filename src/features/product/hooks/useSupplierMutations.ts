/**
 * useSupplierMutations Hook
 * React Query mutations for supplier CRUD operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierService } from '../services/supplierService';
import { SUPPLIER_QUERY_KEYS } from './useSuppliers';
import type {
  SupplierCreateRequest,
  SupplierUpdateRequest,
} from '../types/supplier';

/**
 * Hook to create a new supplier
 */
export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SupplierCreateRequest) => {
      return await supplierService.createSupplier(data);
    },
    onSuccess: () => {
      // Invalidate suppliers list to refetch
      queryClient.invalidateQueries({
        queryKey: SUPPLIER_QUERY_KEYS.lists(),
      });
    },
    retry: false, // Don't retry mutations to prevent duplicate creations
  });
};

/**
 * Hook to update a supplier
 */
export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      supplierId,
      data,
    }: {
      supplierId: string;
      data: SupplierUpdateRequest;
    }) => {
      return await supplierService.updateSupplier(supplierId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate specific supplier detail
      queryClient.invalidateQueries({
        queryKey: SUPPLIER_QUERY_KEYS.detail(variables.supplierId),
      });
      // Also invalidate suppliers list
      queryClient.invalidateQueries({
        queryKey: SUPPLIER_QUERY_KEYS.lists(),
      });
    },
    retry: false,
  });
};

/**
 * Hook to delete a supplier
 */
export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (supplierId: string) => {
      return await supplierService.deleteSupplier(supplierId);
    },
    onSuccess: (_, supplierId) => {
      // Remove supplier from cache
      queryClient.removeQueries({
        queryKey: SUPPLIER_QUERY_KEYS.detail(supplierId),
      });
      // Invalidate suppliers list
      queryClient.invalidateQueries({
        queryKey: SUPPLIER_QUERY_KEYS.lists(),
      });
    },
    retry: false,
  });
};

/**
 * Combined hook for all supplier mutations
 */
export const useSupplierMutations = () => {
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  return {
    createSupplier,
    updateSupplier,
    deleteSupplier,
    // Convenience flags
    isCreating: createSupplier.isPending,
    isUpdating: updateSupplier.isPending,
    isDeleting: deleteSupplier.isPending,
    isMutating:
      createSupplier.isPending ||
      updateSupplier.isPending ||
      deleteSupplier.isPending,
  };
};

