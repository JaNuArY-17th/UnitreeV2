import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/shared/store';

// Basic selectors
export const selectAccountState = (state: RootState) => state.account;

export const selectPostpaidData = createSelector(
  selectAccountState,
  (account) => account.postpaidData
);

export const selectIsLoading = createSelector(
  selectAccountState,
  (account) => account.isLoading
);

export const selectIsActivatingPostpaid = createSelector(
  selectAccountState,
  (account) => account.isActivatingPostpaid
);

export const selectIsInitiatingPayment = createSelector(
  selectAccountState,
  (account) => account.isInitiatingPayment
);

export const selectIsVerifyingPayment = createSelector(
  selectAccountState,
  (account) => account.isVerifyingPayment
);

export const selectIsResendingOtp = createSelector(
  selectAccountState,
  (account) => account.isResendingOtp
);

export const selectPaymentRequest = createSelector(
  selectAccountState,
  (account) => account.paymentRequest
);

export const selectError = createSelector(
  selectAccountState,
  (account) => account.error
);

export const selectActivationError = createSelector(
  selectAccountState,
  (account) => account.activationError
);

export const selectPaymentError = createSelector(
  selectAccountState,
  (account) => account.paymentError
);

// Computed selectors
export const selectPostpaidStatus = createSelector(
  selectPostpaidData,
  (postpaidData) => postpaidData?.status || null
);

export const selectCreditLimit = createSelector(
  selectPostpaidData,
  (postpaidData) => postpaidData?.creditLimit || 0
);

export const selectSpentCredit = createSelector(
  selectPostpaidData,
  (postpaidData) => postpaidData?.spentCredit || 0
);

export const selectAvailableCredit = createSelector(
  selectCreditLimit,
  selectSpentCredit,
  (creditLimit, spentCredit) => creditLimit - spentCredit
);

export const selectDueDate = createSelector(
  selectPostpaidData,
  (postpaidData) => postpaidData?.dueDate || null
);

export const selectCommissionPercent = createSelector(
  selectPostpaidData,
  (postpaidData) => postpaidData?.commissionPercent || 0
);

export const selectIsPostpaidActive = createSelector(
  selectPostpaidStatus,
  (status) => status === 'ACTIVE'
);

export const selectIsPostpaidPending = createSelector(
  selectPostpaidStatus,
  (status) => status === 'PENDING'
);

export const selectIsPostpaidLocked = createSelector(
  selectPostpaidStatus,
  (status) => status === 'LOCKED'
);

export const selectHasPaymentRequest = createSelector(
  selectPaymentRequest,
  (paymentRequest) => paymentRequest !== null
);

export const selectPaymentAmount = createSelector(
  selectPaymentRequest,
  (paymentRequest) => paymentRequest?.amount || null
);

export const selectPaymentTempRequestId = createSelector(
  selectPaymentRequest,
  (paymentRequest) => paymentRequest?.tempRequestId || null
);

export const selectPaymentExpireTime = createSelector(
  selectPaymentRequest,
  (paymentRequest) => paymentRequest?.expireInSeconds || null
);

// Loading state selectors
export const selectIsAnyLoading = createSelector(
  selectIsLoading,
  selectIsActivatingPostpaid,
  selectIsInitiatingPayment,
  selectIsVerifyingPayment,
  selectIsResendingOtp,
  (loading, activating, initiating, verifying, resending) =>
    loading || activating || initiating || verifying || resending
);

// Error state selectors
export const selectHasAnyError = createSelector(
  selectError,
  selectActivationError,
  selectPaymentError,
  (error, activationError, paymentError) =>
    error !== null || activationError !== null || paymentError !== null
);