import { apiClient } from '@/shared/utils/axios';
import { API_ENDPOINTS } from '@/shared/config/env';
import type { BankResponse, BankQueryParams, VietQRBanksResponse, QRGenerationRequest, QRGenerationResponse, QRGenerationParams, LinkedBanksResponse, LinkBankRequest, LinkBankResponse, ListBankResponse, ChooseBank, ChooseBankResponse, CheckBankResponse, withdrawRequest, withdrawResponse, withdrawVerifyRequest, withdrawVerifyResponse, withdrawResendOTP, BankType } from '../types/bank';
 
const localBankJson = require('@/shared/types/bank.json');
import axios from 'axios';
import { bankTypeManager } from '../utils/bankTypeManager';

const VIETQR_API_URL = 'https://api.vietqr.io/v2/banks';

type FetchResponse = {
  success: boolean;
  message?: string;
  data: {
    bankHolder: string;
    bankNumber: string;
  };
};


/**
 * Helper function to get current bank type from manager (async)
 * Returns undefined if bank type is not set from API or persisted
 */
const getCurrentBankType = async (): Promise<BankType | undefined> => {
  return await bankTypeManager.getBankType();
};

/**
 * Helper function to ensure bank type is available (async)
 * Throws error if no bank type is available
 */
const ensureBankType = async (params?: Partial<BankQueryParams>): Promise<BankType> => {
  const bankType = params?.bankType || await getCurrentBankType();
  if (!bankType) {
    throw new Error('Bank type is required but not available. User account type must be loaded from API first.');
  }
  return bankType;
};

// Stubbed service; replace with real API call
export async function fetchBankAccountInfo(_productCode: string): Promise<FetchResponse> {
  await new Promise((r) => setTimeout(r, 300));
  return {
    success: true,
    data: {
      bankHolder: 'Ngo Tuan Anh',
      bankNumber: '1903123456789',
    },
  };
}

/**
 * Bank service for API calls
 */
export const bankService = {
  /**
   * Check bank status
   */
  checkBank: async (params?: Partial<BankQueryParams>): Promise<CheckBankResponse> => {
    const bankType = await ensureBankType(params);
    const queryParams = { ...params, bankType };

    const response = await apiClient.get<CheckBankResponse>(API_ENDPOINTS.BANK.CHECK_BANK, {
      params: queryParams,
    });

    return response.data as CheckBankResponse;
  },

  /**
   * Choose bank for user
   */
  chooseBank: async (params?: Partial<BankQueryParams>): Promise<ChooseBankResponse> => {
    const bankType = await ensureBankType(params);
    const queryParams = { ...params, bankType };
    
    // bankType must be sent as query params, not in request body
    const response = await apiClient.post<ChooseBankResponse>(
      API_ENDPOINTS.BANK.CHOOSE_NUMBER,
      {},
      { params: queryParams }
    );

    return response.data as ChooseBankResponse;
  },

  /**
   * Get user's bank account information
   */
  getMyBankAccount: async (params?: Partial<BankQueryParams>): Promise<BankResponse> => {
    const bankType = await ensureBankType(params);
    const url = `${API_ENDPOINTS.BANK.MY_BANK}?bankType=${bankType}`;
    const response = await apiClient.get<BankResponse>(url);

    // The API client returns response.data which contains the actual API response
    // The API response structure is: { success, message, data: BankAccount, code }
    return response.data as BankResponse;
  },

  /**
   * Get list of banks from VietQR API
   */
  getVietQRBanks: async (): Promise<VietQRBanksResponse> => {
    try {
      const response = await axios.get<VietQRBanksResponse>(VIETQR_API_URL, { timeout: 15000 });
      if (response.data?.data?.length) return response.data;
      // Fallback if empty
      return { code: '00', desc: 'Fallback local bank list', data: localBankJson.data };
    } catch (e) {
      // Fallback to bundled JSON
      return { code: '00', desc: 'Offline local bank list', data: localBankJson.data };
    }
  },

  /**
   * Generate QR code for top-up
   */
  generateQRTopup: async (request: QRGenerationRequest, params?: Partial<QRGenerationParams>): Promise<QRGenerationResponse> => {
    const bankType = await ensureBankType(params);
    const url = `${API_ENDPOINTS.BANK.GENERATE_QR_TOPUP}?bankType=${bankType}`;
    const response = await apiClient.post<QRGenerationResponse>(
      url,
      request
    );
    return response.data as QRGenerationResponse;
  },

  /**
   * Withdraw initiate
   * @param request withdraw details (amount, description, linkedAccountId)
   * @param params bankType wrapper (uses current account type if not provided)
   */
  withdrawInitiate: async (request: withdrawRequest, params?: Partial<BankQueryParams>): Promise<withdrawResponse> => {
    const bankType = await ensureBankType(params);
    const url = `${API_ENDPOINTS.BANK.WITHDRAW_INITIATE}?bankType=${bankType}`;
    const response = await apiClient.post<withdrawResponse>(
      url,
      request
    );
    return response.data as withdrawResponse;
  },

  /**
   * Withdraw resend OTP
   */
  withdrawResendOTP: async (request: withdrawResendOTP): Promise<withdrawResponse> => {
    const response = await apiClient.post<withdrawResponse>(
      API_ENDPOINTS.BANK.WITHDRAW_RESEND,
      request
    )
    return response.data as withdrawResponse
  },

  /**
   * Withdraw verify
   */
  withdrawVerify: async (request: withdrawVerifyRequest): Promise<withdrawVerifyResponse> => {
    const response = await apiClient.post<withdrawVerifyResponse>(
      API_ENDPOINTS.BANK.WITHDRAW_VERIFY,
      request
    )
    return response.data as withdrawVerifyResponse
  },

  /**
   * Get user's linked banks
   */
  getLinkedBanks: async (params?: Partial<BankQueryParams>): Promise<LinkedBanksResponse> => {
    const bankType = await ensureBankType(params);
    const url = `${API_ENDPOINTS.BANK.LINKED_BANKS}?bankType=${bankType}`;
    const response = await apiClient.get<LinkedBanksResponse>(
      url
    );
    return response.data as LinkedBanksResponse;
  },

  /**
   * Link a new bank account
   */
  linkBank: async (request: LinkBankRequest, params?: Partial<BankQueryParams>): Promise<LinkBankResponse> => {
    const bankType = await ensureBankType(params);
    const url = `${API_ENDPOINTS.BANK.LINK_BANK}?bankType=${bankType}`;
    const response = await apiClient.post<LinkBankResponse>(
      url,
      request
    );
    return response.data as LinkBankResponse;
  },

  /**
   * Delete a linked bank account
   */
  deleteLinkedBank: async (accountId: string, params?: Partial<BankQueryParams>): Promise<{ success: boolean; message: string }> => {
    const bankType = await ensureBankType(params);
    const urlWithQuery = `${API_ENDPOINTS.BANK.DELETE_LINKED_BANK}/${accountId}?bankType=${bankType}`;
    const response = await apiClient.delete<{ success: boolean; message: string }>(urlWithQuery);
    return response.data as { success: boolean; message: string };
  },

  /**
   * Set a linked bank as default
   */
  setLinkedBankAsDefault: async (accountId: string, params?: Partial<BankQueryParams>): Promise<{ success: boolean; message: string }> => {
    const bankType = await ensureBankType(params);
    const urlWithQuery = `${API_ENDPOINTS.BANK.SET_BANK_DEFAULT}/${accountId}?bankType=${bankType}`;
    const response = await apiClient.post<{ success: boolean; message: string }>(urlWithQuery, {});
    return response.data as { success: boolean; message: string };
  },

  /**
   * Get bank list from techcombank API
   */
  getBankList: async (): Promise<ListBankResponse> => {
    const response = await apiClient.get<ListBankResponse>(
      API_ENDPOINTS.BANK.GET_LIST_BANK
    );

    return response.data as ListBankResponse
  },

  // NOTE: Transaction-related methods moved to @/features/transactions/services/transactionService
  // Use transactionService.getTransactions() and transactionService.getTransactionDetails() instead
};
