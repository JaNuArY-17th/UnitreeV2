// Banks feature barrel export
export * from './hooks';
export * from './store';
export * from './types';
export * from './screen';

// Re-export commonly used items for convenience
export { useBank } from './hooks/useBank';
export {
  fetchAccountNumbers,
  chooseAccountNumber,
  getMyBankAccount,
  checkBankAccount,
  clearBankError,
} from './store/bankSlice';
export {
  selectAccountNumbers,
  selectBankAccount,
  selectBankIsLoading,
  selectBankError,
  selectBankBalance,
  selectHasBankAccount,
} from './store/bankSelectors';
export type { BankAccount, BankState } from './types/bank';
