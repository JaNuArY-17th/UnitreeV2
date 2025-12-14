import { apiClient } from '@/shared/utils/axios';
import { API_ENDPOINTS } from '@/shared/config/env';
import type { MyPostPaidResponse, RequestPostpaidPayResponse, RequestPostPaidResponse, RequestPostpaidPayResend, RequestPostpaidPayVerify, RequestPostpaidPayVerifyResponse, PostpaidResponse } from '../types/accountType';
import { bankTypeManager } from '@/features/deposit/utils/bankTypeManager';

/**
 * Account service for postpaid API calls
 */
export const accountService = {
  /**
   * Get user's postpaid information
   */
  getMyPostpaid: async ( ): Promise<MyPostPaidResponse> => {
    const bankType = await bankTypeManager.getBankType() || 'STORE';
    const response = await apiClient.get<MyPostPaidResponse>(
      API_ENDPOINTS.BANK.MY_POSTPAID + `?bankType=${bankType}`
    );
    return response.data as MyPostPaidResponse;
  },

  /**
   * Request postpaid activation for user
   */
  requestPostpaid: async (): Promise<RequestPostPaidResponse> => {
    const bankType = await bankTypeManager.getBankType() || 'STORE';
    const response = await apiClient.post<RequestPostPaidResponse>(
      API_ENDPOINTS.BANK.REQUEST_POSTPAID + `?bankType=${bankType}`,
      {}
    );
    return response.data as RequestPostPaidResponse;
  },

  /**
   * Request postpaid payment for user
   */
  requestPostpaidPay: async (amount : string): Promise<RequestPostpaidPayResponse> => {
    const bankType = await bankTypeManager.getBankType() || 'STORE';
    const url = `${API_ENDPOINTS.BANK.POSTPAID_PAY_INITIATE}?amount=${amount}&bankType=${bankType}`;
    // const url = `${API_ENDPOINTS.BANK.POSTPAID_PAY_INITIATE}?amount=500000`;
    const response = await apiClient.post<RequestPostpaidPayResponse>(
      url,
      {}
    );
    return response.data as RequestPostpaidPayResponse;
  },

  /**
   * Resend postpaid payment request
   */
  requestPostpaidPayResend: async (tempRequestId: string): Promise<PostpaidResponse> => {
    const bankType = await bankTypeManager.getBankType() || 'STORE';
    const request: RequestPostpaidPayResend = {
      tempRequestId
    };
    const response = await apiClient.post<PostpaidResponse>(
      API_ENDPOINTS.BANK.POSTPAID_PAY_RESEND + `?bankType=${bankType}`,
      request
    );
    return response.data as PostpaidResponse;
  },

  /**
   * Verify postpaid payment
   */
  requestPostpaidPayVerify: async (tempRequestId: string, otp: string): Promise<RequestPostpaidPayVerifyResponse> => {
    const bankType = await bankTypeManager.getBankType() || 'STORE';
    const response = await apiClient.post<RequestPostpaidPayVerifyResponse>(
      API_ENDPOINTS.BANK.POSTPAID_PAY_VERIFY + `?bankType=${bankType}`,
      { tempRequestId, otp }
    );
    return response.data as RequestPostpaidPayVerifyResponse;
  }
};