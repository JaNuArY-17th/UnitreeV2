/**
 * Supplier Service
 * Handles all supplier-related API calls
 * @see API_DOCUMENTATION.md
 */

import { apiClient } from '@/shared/utils/axios';
import type {
  SupplierApiResponse,
  SupplierListApiResponse,
  SupplierCreateRequest,
  SupplierUpdateRequest,
  SupplierListParams,
} from '../types/supplier';

// API base path - Gateway endpoint
const BASE_PATH = '/pay/v1/pos/suppliers';

/**
 * Build supplier endpoints
 */
const getSupplierEndpoints = () => ({
  LIST: BASE_PATH,
  DETAIL: (supplierId: string) => `${BASE_PATH}/${supplierId}`,
  CREATE: BASE_PATH,
  UPDATE: (supplierId: string) => `${BASE_PATH}/${supplierId}`,
  DELETE: (supplierId: string) => `${BASE_PATH}/${supplierId}`,
});

/**
 * Supplier Service
 */
export const supplierService = {
  /**
   * Get suppliers list with pagination and optional search
   * @param params - Query parameters (page, size, searchTerm)
   */
  getSuppliers: async (
    params?: SupplierListParams
  ): Promise<SupplierListApiResponse> => {
    const endpoints = getSupplierEndpoints();
    const response = await apiClient.get<SupplierListApiResponse>(endpoints.LIST, {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        searchTerm: params?.searchTerm,
      },
    });
    return response.data!;
  },

  /**
   * Get supplier by ID
   * @param supplierId - Supplier ID (UUID)
   */
  getSupplierById: async (
    supplierId: string
  ): Promise<SupplierApiResponse> => {
    const endpoints = getSupplierEndpoints();
    const response = await apiClient.get<SupplierApiResponse>(
      endpoints.DETAIL(supplierId)
    );
    return response.data!;
  },

  /**
   * Create new supplier
   * @param data - Supplier creation data
   */
  createSupplier: async (
    data: SupplierCreateRequest
  ): Promise<SupplierApiResponse> => {
    const endpoints = getSupplierEndpoints();
    const response = await apiClient.post<SupplierApiResponse>(
      endpoints.CREATE,
      data
    );
    return response.data!;
  },

  /**
   * Update supplier
   * @param supplierId - Supplier ID (UUID)
   * @param data - Supplier update data
   */
  updateSupplier: async (
    supplierId: string,
    data: SupplierUpdateRequest
  ): Promise<SupplierApiResponse> => {
    const endpoints = getSupplierEndpoints();
    const response = await apiClient.put<SupplierApiResponse>(
      endpoints.UPDATE(supplierId),
      data
    );
    return response.data!;
  },

  /**
   * Delete supplier
   * @param supplierId - Supplier ID (UUID)
   */
  deleteSupplier: async (
    supplierId: string
  ): Promise<{ success: boolean; message: string; data: null; code: number }> => {
    const endpoints = getSupplierEndpoints();
    const response = await apiClient.delete(endpoints.DELETE(supplierId));
    return response.data as { success: boolean; message: string; data: null; code: number };
  },
};

