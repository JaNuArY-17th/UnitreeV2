/**
 * useSupplier Hook
 * React Query hook for fetching single supplier details
 */

import { useQuery } from '@tanstack/react-query';
import { supplierService } from '../services/supplierService';
import { SUPPLIER_QUERY_KEYS } from './useSuppliers';

/**
 * Hook to get single supplier by ID
 * @param supplierId - Supplier ID (required)
 * @param options - React Query options
 */
export const useSupplier = (
  supplierId: string | undefined,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) => {
  return useQuery({
    queryKey: SUPPLIER_QUERY_KEYS.detail(supplierId || ''),
    queryFn: async () => {
      if (!supplierId) {
        throw new Error('Supplier ID is required');
      }
      return await supplierService.getSupplierById(supplierId);
    },
    enabled: !!supplierId && (options?.enabled ?? true),
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

