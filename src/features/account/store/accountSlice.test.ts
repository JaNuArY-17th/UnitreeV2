import { configureStore } from '@reduxjs/toolkit';
import accountReducer from './accountSlice';

// Create a test store with just the account reducer
const testStore = configureStore({
  reducer: {
    account: accountReducer,
  },
});

// Test the store creation and basic functionality
describe('Account Redux Store', () => {
  it('should create store with account reducer', () => {
    expect(testStore).toBeDefined();
    const state = testStore.getState() as any;
    expect(state.account).toBeDefined();
  });

  it('should have correct initial state', () => {
    const state = testStore.getState() as any;
    const accountState = state.account;
    expect(accountState.postpaidData).toBeNull();
    expect(accountState.isLoading).toBe(false);
    expect(accountState.isActivatingPostpaid).toBe(false);
    expect(accountState.isInitiatingPayment).toBe(false);
    expect(accountState.isVerifyingPayment).toBe(false);
    expect(accountState.isResendingOtp).toBe(false);
    expect(accountState.paymentRequest).toBeNull();
    expect(accountState.error).toBeNull();
    expect(accountState.activationError).toBeNull();
    expect(accountState.paymentError).toBeNull();
  });
});