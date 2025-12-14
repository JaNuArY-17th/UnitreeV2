/**
 * Category Service
 * Handles all category-related API calls
 * @see API_DOCUMENTATION.md
 */

import { apiClient } from '@/shared/utils/axios';
import type {
  CategoryApiResponse,
  CategoryListApiResponse,
  CategoryCreateRequest,
  CategoryUpdateRequest,
  CategoryListParams,
} from '../types/category';

// API base path - Gateway endpoint
const BASE_PATH = '/pay/v1/pos/categories';

/**
 * Build category endpoints
 */
const getCategoryEndpoints = () => ({
  LIST: BASE_PATH,
  DETAIL: (categoryId: string) => `${BASE_PATH}/${categoryId}`,
  CREATE: BASE_PATH,
  UPDATE: (categoryId: string) => `${BASE_PATH}/${categoryId}`,
  DELETE: (categoryId: string) => `${BASE_PATH}/${categoryId}`,
});

/**
 * Category Service
 */
export const categoryService = {
  /**
   * Get categories list with pagination
   * @param params - Query parameters (page, size, searchTerm)
   */
  getCategories: async (
    params?: CategoryListParams
  ): Promise<CategoryListApiResponse> => {
    const endpoints = getCategoryEndpoints();
    const response = await apiClient.get<CategoryListApiResponse>(endpoints.LIST, {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        searchTerm: params?.searchTerm,
      },
    });
    return response.data!;
  },

  /**
   * Get category by ID
   * @param categoryId - Category ID (UUID)
   */
  getCategoryById: async (
    categoryId: string
  ): Promise<CategoryApiResponse> => {
    const endpoints = getCategoryEndpoints();
    const response = await apiClient.get<CategoryApiResponse>(
      endpoints.DETAIL(categoryId)
    );
    return response.data!;
  },

  /**
   * Create new category
   * @param data - Category creation data
   */
  createCategory: async (
    data: CategoryCreateRequest
  ): Promise<CategoryApiResponse> => {
    const endpoints = getCategoryEndpoints();
    const response = await apiClient.post<CategoryApiResponse>(
      endpoints.CREATE,
      data
    );
    return response.data!;
  },

  /**
   * Update category
   * @param categoryId - Category ID (UUID)
   * @param data - Category update data
   */
  updateCategory: async (
    categoryId: string,
    data: CategoryUpdateRequest
  ): Promise<CategoryApiResponse> => {
    const endpoints = getCategoryEndpoints();
    const response = await apiClient.put<CategoryApiResponse>(
      endpoints.UPDATE(categoryId),
      data
    );
    return response.data!;
  },

  /**
   * Delete category
   * @param categoryId - Category ID (UUID)
   */
  deleteCategory: async (
    categoryId: string
  ): Promise<{ success: boolean; message: string; data: null; code: number }> => {
    const endpoints = getCategoryEndpoints();
    const response = await apiClient.delete(endpoints.DELETE(categoryId));
    return response.data as { success: boolean; message: string; data: null; code: number };
  },
};

