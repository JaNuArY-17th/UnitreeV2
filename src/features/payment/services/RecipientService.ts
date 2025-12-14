import { apiClient } from '@/shared/utils/axios';
import { API_ENDPOINTS } from '@/shared/config/env';
import { bankTypeManager } from '@/features/deposit/utils/bankTypeManager';
import type {
    GetRecentRecipientsParams,
    GetRecentRecipientsResponse,
    AddRecentRecipientRequest,
    DeleteRecentRecipientRequest
} from '../types/transfer';

export const RecipientService = {
    getRecentRecipients: async (params: GetRecentRecipientsParams): Promise<GetRecentRecipientsResponse> => {
        const bankType = params.bankType || await bankTypeManager.getBankType() || 'STORE';
        const queryParams = new URLSearchParams({
            bankType,
            page: (params.page || 1).toString(),
            limit: (params.limit || 10).toString()
        }).toString();
        const url = `${API_ENDPOINTS.BANK.GET_RECIPIENTS}?${queryParams}`;
        const response = await apiClient.get<GetRecentRecipientsResponse>(url);
        return response.data as GetRecentRecipientsResponse;
    },

    addRecentRecipient: async (data: AddRecentRecipientRequest): Promise<{ success: boolean; message: string }> => {
        const bankType = await bankTypeManager.getBankType() || 'STORE';
        const queryParams = new URLSearchParams({ bankType }).toString();
        const url = `${API_ENDPOINTS.BANK.GET_RECIPIENTS}?${queryParams}`;
        const response = await apiClient.post<{ success: boolean; message: string }>(url, data);
        return response.data as { success: boolean; message: string };
    },

    deleteRecentRecipients: async (data: DeleteRecentRecipientRequest): Promise<{ success: boolean; message: string }> => {
        const bankType = await bankTypeManager.getBankType() || 'STORE';
        const queryParams = new URLSearchParams({ bankType }).toString();
        const url = `${API_ENDPOINTS.BANK.GET_RECIPIENTS}?${queryParams}`;
        const response = await apiClient.delete<{ success: boolean; message: string }>(url, { data });
        return response.data as { success: boolean; message: string };
    }
}