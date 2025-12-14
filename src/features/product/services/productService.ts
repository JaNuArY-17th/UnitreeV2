/**
 * Product Service
 * Handles all product-related API calls
 * @see API_DOCUMENTATION.md
 */

import { apiClient } from '@/shared/utils/axios';
import type {
  ProductApiResponse,
  ProductListApiResponse,
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductListParams,
} from '../types/product';

// API base path - Gateway endpoint
const BASE_PATH = '/pay/v1/pos/products';

/**
 * Build product endpoints
 */
const getProductEndpoints = () => ({
  LIST: BASE_PATH,
  DETAIL: (productId: string) => `${BASE_PATH}/${productId}`,
  CREATE: BASE_PATH,
  UPDATE: (productId: string) => `${BASE_PATH}/${productId}`,
  DELETE: (productId: string) => `${BASE_PATH}/${productId}`,
});

/**
 * Product Service
 */
export const productService = {
  /**
   * Get products list with pagination
   * @param params - Query parameters (page, size, searchTerm, categoryId)
   */
  getProducts: async (
    params?: ProductListParams
  ): Promise<ProductListApiResponse> => {
    const endpoints = getProductEndpoints();
    const response = await apiClient.get<ProductListApiResponse>(endpoints.LIST, {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        ...(params?.searchTerm && { searchTerm: params.searchTerm }),
        ...(params?.categoryId && { categoryId: params.categoryId }),
      },
    });
    return response.data as ProductListApiResponse;
  },

  /**
   * Get product by ID
   * @param productId - Product ID (UUID)
   */
  getProductById: async (
    productId: string
  ): Promise<ProductApiResponse> => {
    const endpoints = getProductEndpoints();
    const response = await apiClient.get<ProductApiResponse>(
      endpoints.DETAIL(productId)
    );
    return response.data as ProductApiResponse;
  },

  /**
   * Create new product
   * @param data - Product creation data
   */
  createProduct: async (
    data: ProductCreateRequest
  ): Promise<ProductApiResponse> => {
    const endpoints = getProductEndpoints();
    const response = await apiClient.post<ProductApiResponse>(
      endpoints.CREATE,
      data
    );
    return response.data as ProductApiResponse;
  },

  /**
   * Update product
   * @param productId - Product ID (UUID)
   * @param data - Product update data
   */
  updateProduct: async (
    productId: string,
    data: ProductUpdateRequest
  ): Promise<ProductApiResponse> => {
    const endpoints = getProductEndpoints();
    const response = await apiClient.put<ProductApiResponse>(
      endpoints.UPDATE(productId),
      data
    );
    return response.data as ProductApiResponse;
  },

  /**
   * Delete product
   * @param productId - Product ID (UUID)
   */
  deleteProduct: async (
    productId: string
  ): Promise<{ success: boolean; message: string; data: null; code: number }> => {
    const endpoints = getProductEndpoints();
    const response = await apiClient.delete(endpoints.DELETE(productId));
    return response.data as { success: boolean; message: string; data: null; code: number };
  },
};

