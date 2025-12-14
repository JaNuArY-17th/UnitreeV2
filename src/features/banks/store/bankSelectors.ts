import type { RootState } from '@/shared/types/store';

// Base selectors
export const selectBankState = (state: RootState) => state.bank;

export const selectAccountNumbers = (state: RootState) => state.bank.accountNumbers;

export const selectBankAccount = (state: RootState) => state.bank.bankAccount;

export const selectBankIsLoading = (state: RootState) => state.bank.isLoading;

export const selectBankError = (state: RootState) => state.bank.error;

// Computed selectors
export const selectBankBalance = (state: RootState): number => {
  const bankAccount = selectBankAccount(state);
  return bankAccount?.bankBalance || 0;
};

export const selectHasBankAccount = (state: RootState): boolean => {
  const bankAccount = selectBankAccount(state);
  return bankAccount !== null;
};

export const selectBankAccountNumber = (state: RootState): string | null => {
  const bankAccount = selectBankAccount(state);
  return bankAccount?.bankNumber || null;
};

export const selectBankAccountName = (state: RootState): string | null => {
  const bankAccount = selectBankAccount(state);
  return bankAccount?.bankHolder || null;
};

export const selectHasAccountNumbers = (state: RootState): boolean => {
  const accountNumbers = selectAccountNumbers(state);
  return accountNumbers.length > 0;
};

export const selectBankStatus = (state: RootState) => {
  const isLoading = selectBankIsLoading(state);
  const error = selectBankError(state);
  const hasBankAccount = selectHasBankAccount(state);
  
  return {
    isLoading,
    hasError: !!error,
    error,
    hasBankAccount,
    isReady: !isLoading && !error && hasBankAccount,
  };
};
