import { useMutation } from '@tanstack/react-query';
import { bankService } from '../../services/bankService';
import type { withdrawResendOTP, withdrawResponse } from '../../types/bank';

/**
 * Resend OTP for an initiated withdraw (temp transaction)
 */
export const useWithdrawResendOTP = () => {
  return useMutation<withdrawResponse, Error, withdrawResendOTP>({
    mutationFn: async (request) => bankService.withdrawResendOTP(request),
  });
};

export default useWithdrawResendOTP;
