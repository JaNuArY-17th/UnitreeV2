import { useMutation } from '@tanstack/react-query';
import { bankService } from '../../services/bankService';
import type { withdrawVerifyRequest, withdrawVerifyResponse } from '../../types/bank';

/**
 * Verify withdraw with OTP
 */
export const useWithdrawVerify = () => {
  return useMutation<withdrawVerifyResponse, Error, withdrawVerifyRequest>({
    mutationFn: async (request) => bankService.withdrawVerify(request),
  });
};

export default useWithdrawVerify;
