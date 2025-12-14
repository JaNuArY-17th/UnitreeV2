import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { TransferService } from '../services/TransferService';
import type { 
  TransferInitiateResponse,
  TransferVerifyResponse,
  TransactionType
} from '../types/transfer';
import type { ApiResponse } from '@/shared/types/api';

/**
 * Hook for initiating a transfer
 */
export const useTransferInitiate = (): UseMutationResult<
  ApiResponse<TransferInitiateResponse['data']>,
  Error,
  {
    destinationAccountNumber: string;
    amount: string;
    description: string;
    transactionType: TransactionType;
    orderId?: string;
  }
> => {
  return useMutation({
    mutationFn: async ({
      destinationAccountNumber,
      amount,
      description,
      transactionType,
      orderId
    }) => {
      return TransferService.initiateTransfer(
        destinationAccountNumber,
        amount,
        description,
        transactionType,
        orderId
      );
    },
    mutationKey: ['transfer', 'initiate'],
  });
};

/**
 * Hook for verifying a transfer with OTP
 */
export const useTransferVerify = (): UseMutationResult<
  ApiResponse<TransferVerifyResponse['data']>,
  Error,
  {
    tempTransactionId: string;
    otp: string;
  }
> => {
  return useMutation({
    mutationFn: async ({ tempTransactionId, otp }) => {
      return TransferService.verifyTransfer(tempTransactionId, otp);
    },
    mutationKey: ['transfer', 'verify'],
  });
};

/**
 * Hook for resending transfer OTP
 */
export const useTransferResendOtp = (): UseMutationResult<
  ApiResponse<any>,
  Error,
  {
    tempTransactionId: string;
  }
> => {
  return useMutation({
    mutationFn: async ({ tempTransactionId }) => {
      return TransferService.resendTransferOtp(tempTransactionId);
    },
    mutationKey: ['transfer', 'resend-otp'],
  });
};