import { apiClient } from '@/shared/utils/axios';
import { API_ENDPOINTS } from '@/shared/config/env';
import { bankTypeManager } from '@/features/deposit/utils/bankTypeManager';
import type { 
  GenerateQRRequest,
  TransferInitiateRequest, 
  TransferInitiateResponse,
  TransferVerifyRequest,
  TransferVerifyResponse,
  TransferResend,
  TransactionType,
  SearchAccountResponse
} from '../types/transfer';
import type { ApiResponse } from '@/shared/types/api';
import type { BankType } from '@/features/deposit/types/bank';

/**
 * Transfer Service
 * Handles all transfer-related API calls
 */
export class TransferService {
  /**
   * Initiate a transfer transaction
   */
  static async initiateTransfer(
    destinationAccountNumber: string,
    amount: string,
    description: string,
    transactionType: TransactionType,
    orderId?: string
  ): Promise<ApiResponse<TransferInitiateResponse['data']>> {
    const request: TransferInitiateRequest = {
      destinationAccountNumber,
      amount: parseInt(amount, 10),
      description,
      transactionType,
      ...(orderId && { orderId })
    };

    // Get bankType from bankTypeManager, default to 'USER' if not set
    const bankType: BankType = (await bankTypeManager.getBankType()) || 'USER';
    console.log('TransferService - bankType:', bankType, typeof bankType);
    const url = `${API_ENDPOINTS.BANK.TRANSFER_INITIATE}?bankType=${bankType}`;
    console.log('TransferService - URL:', url);

    const response = await apiClient.post<TransferInitiateResponse>(
      url,
      request
    );

    if (!response.data) {
      throw new Error('No response data received');
    }

    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data
    };
  }

  /**
   * Verify transfer with OTP
   */
  static async verifyTransfer(
    tempTransactionId: string,
    otp: string
  ): Promise<ApiResponse<TransferVerifyResponse['data']>> {
    const request: TransferVerifyRequest = {
      tempTransactionId,
      otp
    };

    // Get bankType from cache, default to 'USER' if not set
    const bankType: BankType = (await bankTypeManager.getBankType()) || 'USER';
    const url = `${API_ENDPOINTS.BANK.TRANSFER_VERIFY}?bankType=${bankType}`;

    const response = await apiClient.post<TransferVerifyResponse>(
      url,
      request
    );

    if (!response.data) {
      throw new Error('No response data received');
    }

    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data
    };
  }

  /**
   * Resend OTP for transfer
   */
  static async resendTransferOtp(
    tempTransactionId: string
  ): Promise<ApiResponse<any>> {
    const request: TransferResend = {
      tempTransactionId
    };

    // Get bankType from cache, default to 'USER' if not set
    const bankType: BankType = (await bankTypeManager.getBankType()) || 'USER';
    const url = `${API_ENDPOINTS.BANK.TRANSFER_RESEND}?bankType=${bankType}`;

    const response = await apiClient.post<any>(
      url,
      request
    );

    if (!response.data) {
      throw new Error('No response data received');
    }

    return {
      success: response.data.success || false,
      message: response.data.message || 'Request processed',
      data: response.data.data
    };
  }

  // Search account by account number
  static async searchAccountByNumber(accountNumber: string): Promise<SearchAccountResponse> {
    const url = `${API_ENDPOINTS.BANK.SEARCH_ACCOUNT_BY_NUMBER}?accountNumber=${encodeURIComponent(accountNumber)}`;
    const response = await apiClient.get<SearchAccountResponse>(url);

    if (!response.data) {
      throw new Error('No response data received');
    }

    return response.data as SearchAccountResponse;
  }
}

export default TransferService;