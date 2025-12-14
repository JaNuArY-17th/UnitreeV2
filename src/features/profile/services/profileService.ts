import { apiClient } from '@/shared/utils/axios';
import { API_ENDPOINTS } from '@/shared/config/env';
import { UpdateAvatarRequest, UpdatePhoneNumberRequest, VerifyUpdatePhoneNumberRequest, UpdateEmailRequest, VerifyUpdateEmailRequest } from '../types/profile';

export const profileService = {
    updateAvatar: async (request: UpdateAvatarRequest): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.patch<{ success: boolean; message: string }>(API_ENDPOINTS.USER.UPDATE_AVATAR, request);

        return response.data as { success: boolean; message: string };
    },

    deleteAccount: async (): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.delete<{ success: boolean; message: string }>(API_ENDPOINTS.USER.DELETE_ACCOUNT);

        return response.data as { success: boolean; message: string };
    },

    updatePhoneNumber: async (request: UpdatePhoneNumberRequest): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.post<{ success: boolean; message: string }>(API_ENDPOINTS.USER.UPDATE_PHONE_NUMBER, request);

        return response.data as { success: boolean; message: string };
    },

    verifyUpdatePhoneNumber: async (request: VerifyUpdatePhoneNumberRequest): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.post<{ success: boolean; message: string }>(API_ENDPOINTS.USER.VERIFY_UPDATE_PHONE_NUMBER, request);

        return response.data as { success: boolean; message: string };
    },

    resendUpdatePhoneNumber: async (): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.post<{ success: boolean; message: string }>(API_ENDPOINTS.USER.RESEND_UPDATE_PHONE_NUMBER);

        return response.data as { success: boolean; message: string };
    },

    updateEmail: async (request: UpdateEmailRequest): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.post<{ success: boolean; message: string }>(API_ENDPOINTS.USER.UPDATE_EMAIL, request);

        return response.data as { success: boolean; message: string };
    },

    verifyUpdateEmail: async (request: VerifyUpdateEmailRequest): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.post<{ success: boolean; message: string }>(API_ENDPOINTS.USER.VERIFY_UPDATE_EMAIL, request);

        return response.data as { success: boolean; message: string };
    },

    resendeUpdateEmail: async (): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.post<{ success: boolean; message: string }>(API_ENDPOINTS.USER.RESEND_UPDATE_EMAIL);

        return response.data as { success: boolean; message: string };
    }
}
