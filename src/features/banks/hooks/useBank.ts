import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/useRedux';
import {
  clearBankError,
  fetchAccountNumbers,
  chooseAccountNumber as chooseAccountNumberAction,
  getMyBankAccount as getMyBankAccountAction,
  checkBankAccount as checkBankAccountAction,
  selectAccountNumbers,
  selectBankAccount,
  selectBankIsLoading,
  selectBankError,
} from '../store';
import type { BankAccount } from '../types';

export function useBank() {
  const dispatch = useAppDispatch();

  // Use selectors instead of direct state access
  const accountNumbers = useAppSelector(selectAccountNumbers);
  const bankAccount = useAppSelector(selectBankAccount);
  const isLoading = useAppSelector(selectBankIsLoading);
  const error = useAppSelector(selectBankError);

  // Generic async thunk handler
  const createAsyncHandler = <T>(
    action: any,
    errorMessage: string
  ) => {
    return async (...args: any[]): Promise<T> => {
      try {
        const result = await dispatch(action(...args));

        if (action.fulfilled.match(result)) {
          return result.payload.data || result.payload;
        } else {
          throw new Error(result.payload || errorMessage);
        }
      } catch (err: any) {
        console.error(`Error in ${action.type}:`, err);
        throw err;
      }
    };
  };

  // Create handlers using the generic function
  const getAccountNumbers = createAsyncHandler(
    fetchAccountNumbers,
    'Không thể lấy số tài khoản'
  );

  const chooseAccountNumber = useCallback(async () => {
    try {
      console.log('🚀 [useBank] chooseAccountNumber called - API should be triggered now!');
      const result = await dispatch(chooseAccountNumberAction());
      console.log('🚀 [useBank] chooseAccountNumber result:', result);

      if (chooseAccountNumberAction.fulfilled.match(result)) {
        console.log('✅ [useBank] chooseAccountNumber SUCCESS!');
        return result.payload.data || result.payload;
      } else {
        console.log('❌ [useBank] chooseAccountNumber FAILED:', result.payload);
        throw result.payload || new Error('Không thể chọn số tài khoản');
      }
    } catch (err: any) {
      console.error('🔴 [useBank] chooseAccountNumber ERROR:', err);
      throw err;
    }
  }, [dispatch]);

  const getMyBankAccount = createAsyncHandler<BankAccount | null>(
    getMyBankAccountAction,
    'Không thể lấy thông tin tài khoản'
  );

  // Special case for checkBankAccount - throws the full error for business logic
  const checkBankAccount = useCallback(async () => {
    try {
      const result = await dispatch(checkBankAccountAction());

      if (checkBankAccountAction.fulfilled.match(result)) {
        return result.payload;
      } else {
        // For rejected case, throw the payload which contains the error data
        console.log('🔍 [useBank] checkBankAccount rejected with payload:', result.payload);
        throw result.payload;
      }
    } catch (err: any) {
      console.error('🔴 [useBank] Error in checkBankAccount:', err);

      // If this is a Redux action result, extract the payload
      if (err?.payload) {
        console.log('🔍 [useBank] Throwing error payload:', err.payload);
        throw err.payload;
      }

      // Otherwise throw the original error
      throw err;
    }
  }, [dispatch]);

  const clearBankErrors = useCallback(() => {
    dispatch(clearBankError());
  }, [dispatch]);

  // Hàm lấy số dư tài khoản ngân hàng
  const getMyBankBalance = useCallback(async (): Promise<number> => {
    try {
      const bankData = await getMyBankAccount();
      return bankData?.bankBalance || 0;
    } catch (err) {
      console.error('🔴 [useBank] Error getting bank balance:', err);
      return 0;
    }
  }, [getMyBankAccount]);

  return {
    // State
    accountNumbers,
    bankAccount,
    isLoading,
    error,

    // Actions
    getAccountNumbers,
    chooseAccountNumber,
    getMyBankAccount,
    checkBankAccount,
    clearBankErrors,
    getMyBankBalance,
  };
}
