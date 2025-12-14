import { apiClient } from '@/shared/utils/axios';
import { API_ENDPOINTS, API_CONFIG } from '@/shared/config/env';
import type { EnrollRequest, RemoveRequest, BioResponse, CheckBioResponse } from '../types';

export const bioService = {
  /**
   * Check biometric status
   */
  checkBio: async (): Promise<CheckBioResponse> => {
    const response = await apiClient.get<CheckBioResponse>(API_ENDPOINTS.BIOMETRIC.CHECK);

    return response.data as CheckBioResponse;
  },

  /**
   * Enroll biometric
   */
  enrollBio: async (request: Pick<EnrollRequest, 'old_password' | 'biometric_key'> & Partial<EnrollRequest>): Promise<BioResponse> => {
    const body: EnrollRequest = {
      app_id: typeof request.app_id === 'number' ? request.app_id : (API_CONFIG.HEADERS['x-app-id'] as number),
      old_password: request.old_password,
      biometric_key: request.biometric_key,
    };
    const response = await apiClient.patch<BioResponse>(API_ENDPOINTS.BIOMETRIC.ENROLL, body);
    return response.data as BioResponse;
  },

  /**
   * Remove biometric
   */
  removeBio: async (payload?: Partial<RemoveRequest>): Promise<BioResponse> => {
    const response = await apiClient.patch<BioResponse>(API_ENDPOINTS.BIOMETRIC.REMOVE, payload);
    return response.data as BioResponse;
  }
}