/**
 * Location Service
 * Handles all location-related API calls
 * @see API_DOCUMENTATION.md
 */

import { apiClient } from '@/shared/utils/axios';
import type {
  LocationApiResponse,
  LocationListApiResponse,
  LocationCreateRequest,
  LocationUpdateRequest,
  LocationListParams,
} from '../types/location';

// API base path - Gateway endpoint
const BASE_PATH = '/pay/v1/pos/locations';

/**
 * Build location endpoints
 */
const getLocationEndpoints = () => ({
  LIST: BASE_PATH,
  DETAIL: (locationId: string) => `${BASE_PATH}/${locationId}`,
  CREATE: BASE_PATH,
  UPDATE: (locationId: string) => `${BASE_PATH}/${locationId}`,
  DELETE: (locationId: string) => `${BASE_PATH}/${locationId}`,
});

/**
 * Location Service
 */
export const locationService = {
  /**
   * Get locations list with pagination
   * @param params - Query parameters (page, size, searchTerm)
   */
  getLocations: async (
    params?: LocationListParams
  ): Promise<LocationListApiResponse> => {
    const endpoints = getLocationEndpoints();
    const response = await apiClient.get<LocationListApiResponse>(endpoints.LIST, {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        searchTerm: params?.searchTerm,
      },
    });
    return response.data!;
  },

  /**
   * Get location by ID
   * @param locationId - Location ID (UUID)
   */
  getLocationById: async (
    locationId: string
  ): Promise<LocationApiResponse> => {
    const endpoints = getLocationEndpoints();
    const response = await apiClient.get<LocationApiResponse>(
      endpoints.DETAIL(locationId)
    );
    return response.data!;
  },

  /**
   * Create new location
   * @param data - Location creation data
   */
  createLocation: async (
    data: LocationCreateRequest
  ): Promise<LocationApiResponse> => {
    const endpoints = getLocationEndpoints();
    const response = await apiClient.post<LocationApiResponse>(
      endpoints.CREATE,
      data
    );
    return response.data!;
  },

  /**
   * Update location
   * @param locationId - Location ID (UUID)
   * @param data - Location update data
   */
  updateLocation: async (
    locationId: string,
    data: LocationUpdateRequest
  ): Promise<LocationApiResponse> => {
    const endpoints = getLocationEndpoints();
    const response = await apiClient.put<LocationApiResponse>(
      endpoints.UPDATE(locationId),
      data
    );
    return response.data!;
  },

  /**
   * Delete location
   * @param locationId - Location ID (UUID)
   */
  deleteLocation: async (
    locationId: string
  ): Promise<{ success: boolean; message: string; data: null; code: number }> => {
    const endpoints = getLocationEndpoints();
    const response = await apiClient.delete(endpoints.DELETE(locationId));
    return response.data as { success: boolean; message: string; data: null; code: number };
  },
};

