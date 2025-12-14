import { apiClient } from '@/shared/utils/axios';
import { API_ENDPOINTS } from '@/shared/config';
import type { StoreMyDataResponse, CreateStoreRequest, CreateStoreResponse, BankMyDataResponse, StoreType } from '../types';

export const storeService = {
    // Get current store data 
    getStoreData: async (): Promise<StoreMyDataResponse> => {
        const response = await apiClient.get<StoreMyDataResponse>(API_ENDPOINTS.STORE.MY_STORE);
        return response.data as StoreMyDataResponse;
    },

    // Get my bank data for store
    getMyBankData: async (): Promise<BankMyDataResponse> => {
        const response = await apiClient.get<BankMyDataResponse>(`${API_ENDPOINTS.BANK.MY_BANK}?bankType=STORE`);
        return response.data as BankMyDataResponse;
    },

    // Create a new store
    createStore: async (request: CreateStoreRequest): Promise<CreateStoreResponse> => {
        const response = await apiClient.post<CreateStoreResponse>(API_ENDPOINTS.STORE.CREATE, request);
        return response.data as CreateStoreResponse;
    },

    // Activate store
    activateStore: async (): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.patch<{ success: boolean; message: string }>(API_ENDPOINTS.STORE.ACTIVE);
        return response.data as { success: boolean; message: string };
    }, 

    // Deactivate store
    deactivateStore: async (): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.patch<{ success: boolean; message: string }>(API_ENDPOINTS.STORE.INACTIVE);
        return response.data as { success: boolean; message: string };
    },

    // Get store files (business licenses)
    getStoreFiles: async (storeId: string): Promise<{ 
        success: boolean; 
        message: string; 
        data: Array<{ fileId: string; fileUrl: string }>;
        code: number;
    }> => {
        const response = await apiClient.get(`${API_ENDPOINTS.FILES.GET_STORE_FILES}/${storeId}`);
        return response.data;
    },

    // Remove store file (business license)
    removeStoreFile: async (fileId: string): Promise<{ 
        success: boolean; 
        message: string;
    }> => {
        const response = await apiClient.put(`${API_ENDPOINTS.FILES.REMOVE_STORE_FILE}/${fileId}/remove-store`);
        return response.data;
    },

    // Get store types for business line options
    getStoreTypes: async (): Promise<StoreType[]> => {
        const response = await apiClient.get<StoreType[]>(API_ENDPOINTS.STORE.GET_STORE_TYPE);
        return response.data;
    },
}
