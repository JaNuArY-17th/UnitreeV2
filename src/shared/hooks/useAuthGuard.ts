/**
 * React Hook for Authentication Guard
 * Provides reactive authentication state management
 * Following patterns from Auth0 React SDK and Firebase React hooks
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { authGuard, type AuthGuardEvent } from '@/shared/services/authGuard';

// Auth state interface
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  needsRefresh: boolean;
  expiresAt: number | null;
  timeUntilExpiry: number | null;
  lastChecked: number | null;
}

// Hook options
export interface UseAuthGuardOptions {
  checkOnMount?: boolean;
  autoRefresh?: boolean;
  onLoginRequired?: () => void;
  onTokenRefreshed?: () => void;
  onRefreshFailed?: (error: any) => void;
}

/**
 * useAuthGuard Hook
 * Provides reactive authentication state with automatic token management
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const {
    checkOnMount = true,
    autoRefresh = true,
    onLoginRequired,
    onTokenRefreshed,
    onRefreshFailed,
  } = options;

  // Auth state
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    isRefreshing: false,
    needsRefresh: false,
    expiresAt: null,
    timeUntilExpiry: null,
    lastChecked: null,
  });

  // Refs for stable callbacks
  const optionsRef = useRef(options);
  optionsRef.current = options;

  /**
   * Update auth state
   */
  const updateAuthState = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const [isAuthenticated, needsRefresh, expiry] = await Promise.all([
        authGuard.isAuthenticated(),
        authGuard.needsRefresh(),
        authGuard.getTokenExpiry(),
      ]);

      console.log('🔐 Auth state updated:', {
        isAuthenticated,
        needsRefresh,
        expiresAt: expiry.expiresAt,
        timeUntilExpiry: expiry.timeUntilExpiry,
      });

      setAuthState({
        isAuthenticated,
        isLoading: false,
        isRefreshing: false,
        needsRefresh,
        expiresAt: expiry.expiresAt,
        timeUntilExpiry: expiry.timeUntilExpiry,
        lastChecked: Date.now(),
      });

      return isAuthenticated;
    } catch (error) {
      console.error('Failed to update auth state:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
      }));
      return false;
    }
  }, []);

  /**
   * Handle auth guard events
   */
  const handleAuthEvent = useCallback((event: AuthGuardEvent, data?: any) => {
    switch (event) {
      case 'token-valid':
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          isRefreshing: false,
        }));
        break;

      case 'token-expired':
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: false,
          isRefreshing: false,
        }));
        break;

      case 'token-refreshed':
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          isRefreshing: false,
          needsRefresh: false,
        }));
        optionsRef.current.onTokenRefreshed?.();
        break;

      case 'refresh-failed':
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: false,
          isRefreshing: false,
        }));
        optionsRef.current.onRefreshFailed?.(data);
        break;

      case 'login-required':
        console.log('📨 useAuthGuard: Received login-required event');
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: false,
          isRefreshing: false,
        }));
        console.log('📞 useAuthGuard: Calling onLoginRequired callback...');
        optionsRef.current.onLoginRequired?.();
        console.log('✅ useAuthGuard: onLoginRequired callback completed');
        break;
    }
  }, []);

  /**
   * Force authentication check
   */
  const checkAuth = useCallback(async (): Promise<boolean> => {
    return await updateAuthState();
  }, [updateAuthState]);

  /**
   * Force logout
   */
  const logout = useCallback(async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    await authGuard.logout();
    await updateAuthState();
  }, [updateAuthState]);

  /**
   * Ensure valid token (for API calls)
   */
  const ensureValidToken = useCallback(async (): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isRefreshing: true }));

    try {
      const isValid = await authGuard.ensureValidToken();
      await updateAuthState();
      return isValid;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isRefreshing: false }));
      throw error;
    }
  }, [updateAuthState]);

  // Setup auth guard listener
  useEffect(() => {
    const removeListener = authGuard.addListener(handleAuthEvent);
    
    // Also listen for storage events to detect token changes
    const handleStorageChange = () => {
      console.log('🔄 Storage change detected, updating auth state');
      updateAuthState();
    };
    
    // Check auth state periodically when authenticated
    const interval = setInterval(() => {
      if (authState.isAuthenticated || authState.isLoading) {
        return;
      }
      // Check if we now have tokens that we didn't before
      authGuard.isAuthenticated().then(isAuth => {
        if (isAuth && !authState.isAuthenticated) {
          console.log('🔐 Detected new authentication, updating state');
          updateAuthState();
        }
      });
    }, 1000);
    
    return () => {
      removeListener();
      clearInterval(interval);
    };
  }, [handleAuthEvent, updateAuthState, authState.isAuthenticated, authState.isLoading]);

  // Initial auth check
  useEffect(() => {
    if (checkOnMount) {
      updateAuthState();
    }
  }, [checkOnMount, updateAuthState]);

  // Auto-refresh timer
  useEffect(() => {
    if (!autoRefresh || !authState.isAuthenticated || !authState.timeUntilExpiry) {
      return;
    }

    // Set timer to check auth status when token is close to expiry
    const refreshTime = Math.max(0, authState.timeUntilExpiry - 60000); // 1 minute before expiry

    if (refreshTime > 0) {
      const timer = setTimeout(() => {
        updateAuthState();
      }, refreshTime);

      return () => clearTimeout(timer);
    }
  }, [autoRefresh, authState.isAuthenticated, authState.timeUntilExpiry, updateAuthState]);

  return {
    // State
    ...authState,

    // Actions
    checkAuth,
    logout,
    ensureValidToken,

    // Computed values
    isExpired: authState.expiresAt ? Date.now() > authState.expiresAt : false,
    minutesUntilExpiry: authState.timeUntilExpiry ? Math.floor(authState.timeUntilExpiry / 60000) : null,
  };
}
