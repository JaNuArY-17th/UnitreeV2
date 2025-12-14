import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient } from '@/shared/utils/axios';
import { 
  EContractState, 
  GenerateContractResponse, 
  SignContractResponse, 
  RequestOtpResponse,
  ResendOtpResponse, 
  QueueStatusResponse,
  SignContractRequest,
  QueueStatusRequest
} from '../types/econtract';

// Initial state
const initialState: EContractState = {
  contractJob: null,
  signedContract: null,
  jobStatus: null,
  otpStatus: false,
  isLoading: false,
  error: null,
};

// Async thunk để tạo hợp đồng mới
export const generateContract = createAsyncThunk<
  GenerateContractResponse,
  void,
  { rejectValue: string }
>(
  'econtract/generateContract',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<GenerateContractResponse>('iam/v1/econtract/generate-contract');
      console.log('🔍 [generateContract] response', response);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Không thể tạo hợp đồng');
      }
    } catch (error: any) {
      console.error('🔴 [generateContract] error:', error);
      return rejectWithValue(
        error.message || 'Không thể tạo hợp đồng. Vui lòng thử lại.'
      );
    }
  }
);

// Async thunk để ký hợp đồng
export const signContract = createAsyncThunk<
  SignContractResponse,
  SignContractRequest,
  { rejectValue: string }
>(
  'econtract/signContract',
  async (signData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<SignContractResponse>('iam/v1/econtract/sign-contract', signData);
      console.log('🔍 [signContract] response', response);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Không thể ký hợp đồng');
      }
    } catch (error: any) {
      console.error('🔴 [signContract] error:', error);
      return rejectWithValue(
        error.message || 'Không thể ký hợp đồng. Vui lòng thử lại.'
      );
    }
  }
);

// Async thunk để request OTP
export const requestOtp = createAsyncThunk<
  RequestOtpResponse,
  void,
  { rejectValue: string }
>(
  'econtract/requestOtp',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<RequestOtpResponse>('iam/v1/econtract/request-otp');
      console.log('🔍 [requestOtp] response', response);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Không thể yêu cầu OTP');
      }
    } catch (error: any) {
      console.error('🔴 [requestOtp] error:', error);
      return rejectWithValue(
        error.message || 'Không thể yêu cầu OTP. Vui lòng thử lại.'
      );
    }
  }
);

// Async thunk để gửi lại OTP
export const resendOtp = createAsyncThunk<
  ResendOtpResponse,
  void,
  { rejectValue: string }
>(
  'econtract/resendOtp',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ResendOtpResponse>('iam/v1/econtract/resend-otp');
      console.log('🔍 [resendOtp] response', response);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Không thể gửi lại OTP');
      }
    } catch (error: any) {
      console.error('🔴 [resendOtp] error:', error);
      return rejectWithValue(
        error.message || 'Không thể gửi lại OTP. Vui lòng thử lại.'
      );
    }
  }
);

// Async thunk để kiểm tra trạng thái queue
export const checkQueueStatus = createAsyncThunk<
  QueueStatusResponse,
  QueueStatusRequest,
  { rejectValue: string }
>(
  'econtract/checkQueueStatus',
  async (params, { rejectWithValue }) => {
    try {
      const { queue_name, job_id } = params;
      const response = await apiClient.get<QueueStatusResponse>(`iam/v1/queues/status?queue_name=${queue_name}&job_id=${job_id}`);
      console.log('🔍 [checkQueueStatus] response', response);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Không thể kiểm tra trạng thái');
      }
    } catch (error: any) {
      console.error('🔴 [checkQueueStatus] error:', error);
      return rejectWithValue(
        error.message || 'Không thể kiểm tra trạng thái. Vui lòng thử lại.'
      );
    }
  }
);

// EContract slice
const econtractSlice = createSlice({
  name: 'econtract',
  initialState,
  reducers: {
    clearEContractError: (state) => {
      state.error = null;
    },
    resetEContractState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate Contract
      .addCase(generateContract.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateContract.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contractJob = action.payload.data;
      })
      .addCase(generateContract.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Có lỗi xảy ra khi tạo hợp đồng';
      })

      // Sign Contract
      .addCase(signContract.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signContract.fulfilled, (state, action) => {
        state.isLoading = false;
        state.signedContract = action.payload.data;
      })
      .addCase(signContract.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Có lỗi xảy ra khi ký hợp đồng';
      })

      // Request OTP
      .addCase(requestOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpStatus = action.payload.data.success;
      })
      .addCase(requestOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Có lỗi xảy ra khi yêu cầu OTP';
      })

      // Resend OTP
      .addCase(resendOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpStatus = action.payload.data.success;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Có lỗi xảy ra khi gửi lại OTP';
      })

      // Check Queue Status
      .addCase(checkQueueStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkQueueStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobStatus = action.payload.data.result?.status || null;
      })
      .addCase(checkQueueStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Có lỗi xảy ra khi kiểm tra trạng thái';
      });
  },
});

export const { clearEContractError, resetEContractState } = econtractSlice.actions;
export default econtractSlice.reducer;
