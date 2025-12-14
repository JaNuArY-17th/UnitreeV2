import { useMutation } from '@tanstack/react-query';
import { bankService } from '../../services/bankService';
import type { withdrawRequest, withdrawResponse, BankQueryParams } from '../../types/bank';

/**
 * Initiate a withdraw request (creates temp transaction + sends OTP)
 */
interface WithdrawInitiateVariables {
  request: withdrawRequest;
  params?: Partial<BankQueryParams>;
}

export const useWithdrawInitiate = () => {
  return useMutation<withdrawResponse, Error, WithdrawInitiateVariables>({
    mutationFn: async ({ request, params }: WithdrawInitiateVariables) =>
      bankService.withdrawInitiate(request, params),
  });
};

export default useWithdrawInitiate;
