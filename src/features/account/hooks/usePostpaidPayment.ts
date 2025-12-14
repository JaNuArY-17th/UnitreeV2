import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { accountService } from '../services/accountService';
import type { 
  RequestPostpaidPayResponse,
  RequestPostpaidPayVerifyResponse,
  PostpaidResponse
} from '../types/accountType';

/**
 * Hook for initiating postpaid payment
 */
export const usePostpaidPaymentInitiate = (): UseMutationResult<
  RequestPostpaidPayResponse,
  Error,
  {
    amount: string;
  }
> => {
  return useMutation({
    mutationFn: async ({ amount }) => {
      return accountService.requestPostpaidPay(amount);
    },
    mutationKey: ['postpaid', 'payment', 'initiate'],
  });
};

/**
 * Hook for verifying postpaid payment with OTP
 */
export const usePostpaidPaymentVerify = (): UseMutationResult<
  RequestPostpaidPayVerifyResponse,
  Error,
  {
    tempRequestId: string;
    otp: string;
  }
> => {
  return useMutation({
    mutationFn: async ({ tempRequestId, otp }) => {
      return accountService.requestPostpaidPayVerify(tempRequestId, otp);
    },
    mutationKey: ['postpaid', 'payment', 'verify'],
  });
};

/**
 * Hook for resending postpaid payment OTP
 */
export const usePostpaidPaymentResendOtp = (): UseMutationResult<
  PostpaidResponse,
  Error,
  {
    tempRequestId: string;
  }
> => {
  return useMutation({
    mutationFn: async ({ tempRequestId }) => {
      return accountService.requestPostpaidPayResend(tempRequestId);
    },
    mutationKey: ['postpaid', 'payment', 'resend-otp'],
  });
};