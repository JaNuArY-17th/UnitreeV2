/**
 * Variation Service
 * Handles all product variation-related API calls
 * @see API_DOCUMENTATION.md
 */

import { apiClient } from '@/shared/utils/axios';
import type {
  VariationApiResponse,
  VariationListApiResponse,
  VariationCreateRequest,
  VariationUpdateRequest,
  GlobalVariationSearchParams,
} from '../types/variation';

// API base path - Gateway endpoint
const BASE_PATH = '/pay/v1/pos/products';
const GLOBAL_VARIATIONS_PATH = '/pay/v1/pos/variations';

/**
 * Build variation endpoints
 */
const getVariationEndpoints = (productId: string) => ({
  LIST: `${BASE_PATH}/${productId}/variations`,
  DETAIL: (variationId: string) =>
    `${BASE_PATH}/${productId}/variations/${variationId}`,
  CREATE: `${BASE_PATH}/${productId}/variations`,
  UPDATE: (variationId: string) =>
    `${BASE_PATH}/${productId}/variations/${variationId}`,
  DELETE: (variationId: string) =>
    `${BASE_PATH}/${productId}/variations/${variationId}`,
});

/**
 * Variation Service
 */
export const variationService = {
  /**
   * Get variations list for a product
   * @param productId - Product ID (UUID)
   */
  getVariations: async (
    productId: string
  ): Promise<VariationListApiResponse> => {
    const endpoints = getVariationEndpoints(productId);
    const response = await apiClient.get<VariationListApiResponse>(endpoints.LIST);
    return response.data!;
  },

  /**
   * Get variation by ID
   * @param productId - Product ID (UUID)
   * @param variationId - Variation ID (UUID)
   */
  getVariationById: async (
    productId: string,
    variationId: string
  ): Promise<VariationApiResponse> => {
    const endpoints = getVariationEndpoints(productId);
    const response = await apiClient.get<VariationApiResponse>(
      endpoints.DETAIL(variationId)
    );
    return response.data!;
  },

  /**
   * Create new variation
   * @param productId - Product ID (UUID)
   * @param data - Variation creation data
   */
  createVariation: async (
    productId: string,
    data: VariationCreateRequest
  ): Promise<VariationApiResponse> => {
    const endpoints = getVariationEndpoints(productId);
    const response = await apiClient.post<VariationApiResponse>(
      endpoints.CREATE,
      data
    );
    return response.data!;
  },

  /**
   * Update variation
   * @param productId - Product ID (UUID)
   * @param variationId - Variation ID (UUID)
   * @param data - Variation update data
   */
  updateVariation: async (
    productId: string,
    variationId: string,
    data: VariationUpdateRequest
  ): Promise<VariationApiResponse> => {
    const endpoints = getVariationEndpoints(productId);
    const response = await apiClient.put<VariationApiResponse>(
      endpoints.UPDATE(variationId),
      data
    );
    return response.data!;
  },

  /**
   * Delete variation
   * @param productId - Product ID (UUID)
   * @param variationId - Variation ID (UUID)
   */
  deleteVariation: async (
    productId: string,
    variationId: string
  ): Promise<{ success: boolean; message: string; data: null; code: number }> => {
    const endpoints = getVariationEndpoints(productId);
    const response = await apiClient.delete(endpoints.DELETE(variationId));
    return response.data as { success: boolean; message: string; data: null; code: number };
  },

  /**
   * Search all variations globally (across all products)
   * @param params - Search parameters (name, status)
   */
  searchGlobalVariations: async (
    params?: GlobalVariationSearchParams
  ): Promise<VariationListApiResponse> => {
    const response = await apiClient.get<VariationListApiResponse>(
      GLOBAL_VARIATIONS_PATH,
      { params }
    );
    return response.data!;
  },
};

