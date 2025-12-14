import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { accountService } from '../services/accountService';
import type {
  MyPostPaidResponse,
  RequestPostPaidResponse,
  RequestPostpaidPayResponse,
  RequestPostpaidPayVerifyResponse,
  PostpaidResponse,
  PostpaidStatus
} from '../types/accountType';

// Account state interface
export interface AccountState {
  // Postpaid account data
  postpaidData: {
    userId: string;
    creditLimit: number;
    spentCredit: number;
    commissionPercent: number;
    status: PostpaidStatus;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
  } | null;

  // UI state
  isLoading: boolean;
  isActivatingPostpaid: boolean;
  isInitiatingPayment: boolean;
  isVerifyingPayment: boolean;
  isResendingOtp: boolean;

  // Payment flow state
  paymentRequest: {
    tempRequestId: string;
    phone: string;
    expireInSeconds: number;
    amount: string;
  } | null;

  // Error state
  error: string | null;
  activationError: string | null;
  paymentError: string | null;
}

// Initial state
const initialState: AccountState = {
  postpaidData: null,
  isLoading: false,
  isActivatingPostpaid: false,
  isInitiatingPayment: false,
  isVerifyingPayment: false,
  isResendingOtp: false,
  paymentRequest: null,
  error: null,
  activationError: null,
  paymentError: null,
};

// Async thunks for account operations

/**
 * Fetch user's postpaid information
 */
export const fetchPostpaidData = createAsyncThunk(
  'account/fetchPostpaidData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await accountService.getMyPostpaid();
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to fetch postpaid data');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch postpaid data');
    }
  }
);

/**
 * Request postpaid activation
 */
export const requestPostpaidActivation = createAsyncThunk(
  'account/requestPostpaidActivation',
  async (_, { rejectWithValue }) => {
    try {
      const response = await accountService.requestPostpaid();
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to request postpaid activation');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to request postpaid activation');
    }
  }
);

/**
 * Initiate postpaid payment
 */
export const initiatePostpaidPayment = createAsyncThunk(
  'account/initiatePostpaidPayment',
  async (amount: string, { rejectWithValue }) => {
    try {
      const response = await accountService.requestPostpaidPay(amount);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to initiate payment');
      }
      return {
        requestData: response.data,
        amount,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to initiate payment');
    }
  }
);

/**
 * Verify postpaid payment with OTP
 */
export const verifyPostpaidPayment = createAsyncThunk(
  'account/verifyPostpaidPayment',
  async (
    { tempRequestId, otp }: { tempRequestId: string; otp: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await accountService.requestPostpaidPayVerify(tempRequestId, otp);
      if (!response.success) {
        return rejectWithValue(response.message || 'Payment verification failed');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Payment verification failed');
    }
  }
);

/**
 * Resend postpaid payment OTP
 */
export const resendPostpaidPaymentOtp = createAsyncThunk(
  'account/resendPostpaidPaymentOtp',
  async (tempRequestId: string, { rejectWithValue }) => {
    try {
      const response = await accountService.requestPostpaidPayResend(tempRequestId);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to resend OTP');
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to resend OTP');
    }
  }
);

// Account slice
const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    // Clear errors
    clearError: (state) => {
      state.error = null;
    },
    clearActivationError: (state) => {
      state.activationError = null;
    },
    clearPaymentError: (state) => {
      state.paymentError = null;
    },

    // Reset payment flow
    resetPaymentFlow: (state) => {
      state.paymentRequest = null;
      state.paymentError = null;
      state.isInitiatingPayment = false;
      state.isVerifyingPayment = false;
      state.isResendingOtp = false;
    },

    // Update postpaid data (for optimistic updates or cache updates)
    updatePostpaidData: (state, action: PayloadAction<Partial<AccountState['postpaidData']>>) => {
      if (state.postpaidData) {
        state.postpaidData = { ...state.postpaidData, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch postpaid data
    builder
      .addCase(fetchPostpaidData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPostpaidData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.postpaidData = {
          ...action.payload,
          status: action.payload.status as PostpaidStatus,
        };
        state.error = null;
      })
      .addCase(fetchPostpaidData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Request postpaid activation
      .addCase(requestPostpaidActivation.pending, (state) => {
        state.isActivatingPostpaid = true;
        state.activationError = null;
      })
      .addCase(requestPostpaidActivation.fulfilled, (state, action) => {
        state.isActivatingPostpaid = false;
        // Update status if activation was successful
        if (state.postpaidData) {
          state.postpaidData.status = action.payload.status;
        }
        state.activationError = null;
      })
      .addCase(requestPostpaidActivation.rejected, (state, action) => {
        state.isActivatingPostpaid = false;
        state.activationError = action.payload as string;
      })

      // Initiate postpaid payment
      .addCase(initiatePostpaidPayment.pending, (state) => {
        state.isInitiatingPayment = true;
        state.paymentError = null;
      })
      .addCase(initiatePostpaidPayment.fulfilled, (state, action) => {
        state.isInitiatingPayment = false;
        state.paymentRequest = {
          tempRequestId: action.payload.requestData.requestId,
          phone: action.payload.requestData.phone,
          expireInSeconds: action.payload.requestData.expireInSeconds,
          amount: action.payload.amount,
        };
        state.paymentError = null;
      })
      .addCase(initiatePostpaidPayment.rejected, (state, action) => {
        state.isInitiatingPayment = false;
        state.paymentError = action.payload as string;
      })

      // Verify postpaid payment
      .addCase(verifyPostpaidPayment.pending, (state) => {
        state.isVerifyingPayment = true;
        state.paymentError = null;
      })
      .addCase(verifyPostpaidPayment.fulfilled, (state, action) => {
        state.isVerifyingPayment = false;
        // Update postpaid data after successful payment
        if (state.postpaidData) {
          state.postpaidData.spentCredit = action.payload.spentCredit;
          state.postpaidData.status = action.payload.status;
        }
        // Clear payment request after successful verification
        state.paymentRequest = null;
        state.paymentError = null;
      })
      .addCase(verifyPostpaidPayment.rejected, (state, action) => {
        state.isVerifyingPayment = false;
        state.paymentError = action.payload as string;
      })

      // Resend payment OTP
      .addCase(resendPostpaidPaymentOtp.pending, (state) => {
        state.isResendingOtp = true;
        state.paymentError = null;
      })
      .addCase(resendPostpaidPaymentOtp.fulfilled, (state) => {
        state.isResendingOtp = false;
        state.paymentError = null;
      })
      .addCase(resendPostpaidPaymentOtp.rejected, (state, action) => {
        state.isResendingOtp = false;
        state.paymentError = action.payload as string;
      });
  },
});

// Export actions
export const {
  clearError,
  clearActivationError,
  clearPaymentError,
  resetPaymentFlow,
  updatePostpaidData,
} = accountSlice.actions;

// Export reducer
export default accountSlice.reducer;