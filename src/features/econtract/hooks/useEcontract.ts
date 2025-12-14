import { useAppDispatch, useAppSelector } from '@/shared/hooks/useRedux';
import { RootState } from '@/shared/types/store';
import {
  generateContract as generateContractAction,
  signContract as signContractAction,
  requestOtp as requestOtpAction,
  resendOtp as resendOtpAction,
  checkQueueStatus as checkQueueStatusAction,
  clearEContractError,
  resetEContractState
} from '../store/econtractSlice';
import { useCallback } from 'react';
import {
  SignContractRequest,
  QueueStatusRequest,
  SignedContractInfo,
  QueueStatusResponse
} from '../types/econtract';

export function useEcontract() {
  const dispatch = useAppDispatch();
  const { 
    contractJob, 
    signedContract, 
    jobStatus, 
    otpStatus, 
    isLoading, 
    error 
  } = useAppSelector((state: RootState) => state.econtract);

  /**
   * Tạo hợp đồng mới
   */
  const generateContract = useCallback(async () => {
    try {
      const result = await dispatch(generateContractAction());

      if (generateContractAction.fulfilled.match(result)) {
        return result.payload.data;
      } else {
        throw new Error(result.payload as string || 'Không thể tạo hợp đồng');
      }
    } catch (generateError: any) {
      console.error('Error generating contract:', generateError);
      throw generateError;
    }
  }, [dispatch]);

  /**
   * Ký hợp đồng
   * @param signData Dữ liệu ký hợp đồng (OTP và sign_base64)
   */
  const signContract = useCallback(async (signData: SignContractRequest): Promise<SignedContractInfo> => {
    try {
      const result = await dispatch(signContractAction(signData));

      if (signContractAction.fulfilled.match(result)) {
        return result.payload.data;
      } else {
        throw new Error(result.payload as string || 'Không thể ký hợp đồng');
      }
    } catch (signError: any) {
      console.error('Error signing contract:', signError);
      throw signError;
    }
  }, [dispatch]);

  /**
   * Yêu cầu OTP
   */
  const requestOtp = useCallback(async (): Promise<boolean> => {
    try {
      const result = await dispatch(requestOtpAction());

      if (requestOtpAction.fulfilled.match(result)) {
        return result.payload.data.success;
      } else {
        throw new Error(result.payload as string || 'Không thể yêu cầu OTP');
      }
    } catch (requestError: any) {
      console.error('Error requesting OTP:', requestError);
      throw requestError;
    }
  }, [dispatch]);

  /**
   * Gửi lại OTP
   */
  const resendOtp = useCallback(async (): Promise<boolean> => {
    try {
      const result = await dispatch(resendOtpAction());

      if (resendOtpAction.fulfilled.match(result)) {
        return result.payload.data.success;
      } else {
        throw new Error(result.payload as string || 'Không thể gửi lại OTP');
      }
    } catch (resendError: any) {
      console.error('Error resending OTP:', resendError);
      throw resendError;
    }
  }, [dispatch]);

  /**
   * Kiểm tra trạng thái job trong queue
   * @param params Thông tin queue_name và job_id
   */
  const checkQueueStatus = useCallback(async (params: QueueStatusRequest): Promise<QueueStatusResponse> => {
    try {
      const result = await dispatch(checkQueueStatusAction(params));

      if (checkQueueStatusAction.fulfilled.match(result)) {
        return result.payload;
      } else {
        throw new Error(result.payload as string || 'Không thể kiểm tra trạng thái');
      }
    } catch (queueError: any) {
      console.error('Error checking queue status:', queueError);
      throw queueError;
    }
  }, [dispatch]);

  /**
   * Clear errors
   */
  const clearErrors = useCallback(() => {
    dispatch(clearEContractError());
  }, [dispatch]);

  /**
   * Reset state
   */
  const resetState = useCallback(() => {
    dispatch(resetEContractState());
  }, [dispatch]);

  return {
    contractJob,
    signedContract,
    jobStatus,
    otpStatus,
    isLoading,
    error,
    generateContract,
    signContract,
    requestOtp,
    resendOtp,
    checkQueueStatus,
    clearErrors,
    resetState,
  };
}
