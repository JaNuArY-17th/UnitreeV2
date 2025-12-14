import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient } from '@/shared/utils/axios';
import { bankTypeManager } from '../utils';
import type { BankState, GetAccountNumbersResponse, ChooseAccountNumberResponse, MyBankAccountResponse } from '../types';

// Generic error handler for bank operations
const handleBankError = (error: any, defaultMessage: string) => {
  console.error('🔴 Bank operation error:', error);
  console.error('🔴 Error response:', error.response?.data);
  return error.response?.data?.message || error.message || defaultMessage;
};

// Generic async thunk creator for bank operations
const createBankAsyncThunk = <TReturn, TArg = void>(
  typePrefix: string,
  apiCall: (arg: TArg) => Promise<any>,
  defaultErrorMessage: string
) => {
  return createAsyncThunk<TReturn, TArg, { rejectValue: string }>(
    typePrefix,
    async (arg, { rejectWithValue }) => {
      try {
        const response = await apiCall(arg);
        console.log(`🔍 [${typePrefix}] response`, response);

        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || defaultErrorMessage);
        }
      } catch (error: any) {
        return rejectWithValue(handleBankError(error, defaultErrorMessage));
      }
    }
  );
};

// Initial state
const initialState: BankState = {
  accountNumbers: [],
  bankAccount: null,
  isLoading: false,
  error: null,
};

// Bank API operations
export const fetchAccountNumbers = createBankAsyncThunk<GetAccountNumbersResponse>(
  'bank/fetchAccountNumbers',
  () => apiClient.get('/banks/get-number'),
  'Không thể lấy số tài khoản. Vui lòng thử lại.'
);

export const chooseAccountNumber = createAsyncThunk<
  ChooseAccountNumberResponse,
  void,
  { rejectValue: string }
>(
  'bank/chooseAccountNumber',
  async (_, { rejectWithValue }) => {
    try {
  const bankType = await bankTypeManager.getBankType();
  if (!bankType) throw new Error('bankType is not set');
  const response = await apiClient.post(`wallet/v1/banks/choose-number?bankType=${bankType}`);
      console.log('[chooseAccountNumber] response', response);
      if (response.success && response.data) {
        // Return the full response to match ChooseAccountNumberResponse type
        return response as ChooseAccountNumberResponse;
      } else {
        throw new Error(response.message || 'Không thể chọn số tài khoản. Vui lòng thử lại.');
      }
    } catch (error: any) {
      return rejectWithValue(handleBankError(error, 'Không thể chọn số tài khoản. Vui lòng thử lại.'));
    }
  }
);

export const getMyBankAccount = createAsyncThunk<
  MyBankAccountResponse | null,
  void,
  { rejectValue: any }
>(
  'bank/getMyBankAccount',
  async (_, { rejectWithValue }) => {
    try {
  const bankType = await bankTypeManager.getBankType();
  if (!bankType) throw new Error('bankType is not set');
  const response = await apiClient.get<MyBankAccountResponse>(`wallet/v1/banks/my?bankType=${bankType}`);
      console.log('🔍 [getMyBankAccount] response', response);

      if (response.success && response.data) {
        return response.data;
      } else {
        // Handle success:false as account not found - return null instead of rejecting
        // This allows the hook to handle the null case and create account
        console.log('🔍 [getMyBankAccount] Account not found, returning null');
        return null;
      }
    } catch (error: any) {
      console.error('🔴 [getMyBankAccount] error:', error);

      // Create a more complete error object that includes all relevant information
      const enhancedError = {
        message: error.message || 'Unknown error',
        data: error.data,
        status: error.status,
        code: error.status || error.code,
      };

      // Return the enhanced error data for business logic processing
      return rejectWithValue(enhancedError);
    }
  }
);

// Special case for checkBankAccount - returns error data for business logic
export const checkBankAccount = createAsyncThunk<
  any,
  void,
  { rejectValue: any }
>(
  'bank/checkBankAccount',
  async (_, { rejectWithValue }) => {
    try {
  const bankType = await bankTypeManager.getBankType();
  if (!bankType) throw new Error('bankType is not set');
  const response = await apiClient.get(`wallet/v1/banks/check?bankType=${bankType}`);
      console.log('🔍 [checkBankAccount] response', response);

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to check bank account');
      }
    } catch (error: any) {
      console.error('🔴 [checkBankAccount] error:', error);

      // Create a more complete error object that includes all relevant information
      const enhancedError = {
        message: error.message || 'Unknown error',
        data: error.data,
        status: error.status,
        code: error.status || error.code,
      };

      // Return the enhanced error data for business logic processing
      return rejectWithValue(enhancedError);
    }
  }
);

// Generic reducer handlers
const createPendingHandler = (state: BankState) => {
  state.isLoading = true;
  state.error = null;
};

const createFulfilledHandler = (state: BankState) => {
  state.isLoading = false;
};

const createRejectedHandler = (defaultMessage: string) => (state: BankState, action: any) => {
  state.isLoading = false;
  state.error = action.payload || defaultMessage;
};

// Bank slice
const bankSlice = createSlice({
  name: 'bank',
  initialState,
  reducers: {
    clearBankError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch account numbers
    builder
      .addCase(fetchAccountNumbers.pending, createPendingHandler)
      .addCase(fetchAccountNumbers.fulfilled, (state, action) => {
        createFulfilledHandler(state);
        state.accountNumbers = action.payload.data || [];
      })
      .addCase(fetchAccountNumbers.rejected, createRejectedHandler('Có lỗi xảy ra khi lấy số tài khoản'));

    // Choose account number
    builder
      .addCase(chooseAccountNumber.pending, createPendingHandler)
      .addCase(chooseAccountNumber.fulfilled, createFulfilledHandler)
      .addCase(chooseAccountNumber.rejected, createRejectedHandler('Có lỗi xảy ra khi chọn số tài khoản'));

    // Check bank account
    builder
      .addCase(checkBankAccount.pending, createPendingHandler)
      .addCase(checkBankAccount.fulfilled, createFulfilledHandler)
      .addCase(checkBankAccount.rejected, createRejectedHandler('Có lỗi xảy ra khi kiểm tra tài khoản'));

    // Get my bank account
    builder
      .addCase(getMyBankAccount.pending, createPendingHandler)
      .addCase(getMyBankAccount.fulfilled, (state, action) => {
        createFulfilledHandler(state);
        // Handle both success with data and null (account not found) cases
        state.bankAccount = action.payload?.data || null;
      })
      .addCase(getMyBankAccount.rejected, createRejectedHandler('Có lỗi xảy ra khi lấy thông tin tài khoản'));
  },
});

export const { clearBankError } = bankSlice.actions;
export default bankSlice.reducer;
