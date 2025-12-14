import { apiClient } from '@/shared/utils/axios';
import { API_ENDPOINTS } from '@/shared/config/env';
import type { GenerateQRRequest, QRInformationResponse, QRInformationRequest, QRApiResponse } from '../types/transfer';
import { bankTypeManager } from '../../deposit/utils/bankTypeManager';
import { BankType } from '../../deposit';


/**
 * Helper function to get current bank type from manager (async)
 * Falls back to 'STORE' if not set
 */
const getCurrentBankType = async (): Promise<BankType> => {
  const type = await bankTypeManager.getBankType();
  return type || 'STORE';
};

export const QRService = {
  /* Generate QR Code for payment */
  generatePaymentQR: async (data: GenerateQRRequest) => {
    const bankType = await getCurrentBankType();
    const url = `${API_ENDPOINTS.BANK.GENERATE_QR}?bankType=${bankType}`;
    const response = await apiClient.post(url, data);
    return response.data;
  },

  // Get QR Information
  getQRInformation: async (request: QRInformationRequest): Promise<QRInformationResponse> => {
    const response = await apiClient.post<QRInformationResponse>(API_ENDPOINTS.BANK.GET_QR_INFORMATION, request);
    return response.data as QRInformationResponse;
  },

  // Generate QR code for store
  generateStoreQR: async (): Promise<QRApiResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.STORE.QR_STORE, {
      amount: 0,
      description: ""
    });
    return response.data as QRApiResponse;
  }
};
