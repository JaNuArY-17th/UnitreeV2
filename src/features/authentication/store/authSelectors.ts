import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/shared/types/store';
import type { AuthState } from '../types/auth';

// Base selector
const selectAuthState = (state: RootState): AuthState => state.auth;

// Memoized selectors
export const selectUser = createSelector(
  [selectAuthState],
  (auth) => auth.user
);

export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated
);

export const selectIsLoading = createSelector(
  [selectAuthState],
  (auth) => auth.isLoading
);

export const selectAuthError = createSelector(
  [selectAuthState],
  (auth) => auth.error
);

export const selectAccessToken = createSelector(
  [selectAuthState],
  (auth) => auth.accessToken
);

export const selectRefreshToken = createSelector(
  [selectAuthState],
  (auth) => auth.refreshToken
);

// Computed selectors
export const selectUserProfile = createSelector(
  [selectUser],
  (user) => user?.profile
);

export const selectUserName = createSelector(
  [selectUser],
  (user) => user?.name || user?.full_name || user?.profile?.firstName || 'User'
);

export const selectUserPhone = createSelector(
  [selectUser],
  (user) => user?.phone_number
);

export const selectIsVerified = createSelector(
  [selectUser],
  (user) => user?.is_verified || false
);

export const selectHasError = createSelector(
  [selectAuthError],
  (error) => !!error
);

export const selectIsInitialized = createSelector(
  [selectAuthState],
  (auth) => !auth.isLoading && (auth.isAuthenticated || auth.error === null)
);

// Combined selectors
export const selectAuthStatus = createSelector(
  [selectIsAuthenticated, selectIsLoading, selectAuthError],
  (isAuthenticated, isLoading, error) => ({
    isAuthenticated,
    isLoading,
    hasError: !!error,
    error,
  })
);

export const selectUserInfo = createSelector(
  [selectUser, selectIsAuthenticated],
  (user, isAuthenticated) => ({
    user,
    isAuthenticated,
    isVerified: user?.is_verified || false,
    name: user?.name || user?.full_name || user?.profile?.firstName || 'User',
    phone: user?.phone_number,
  })
);
