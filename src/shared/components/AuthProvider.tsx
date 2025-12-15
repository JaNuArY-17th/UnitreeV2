/**
 * Authentication Provider Component
 * Provides app-wide authentication state management
 * Following patterns from Auth0 React SDK and Firebase React
 */

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthGuard, type AuthState } from '@/shared/hooks/useAuthGuard';
import { useAppDispatch } from '@/shared/hooks/useRedux';
import { setAuthenticationState } from '@/features/authentication/store/authSlice';

// Auth context interface
interface AuthContextValue extends AuthState {
  checkAuth: () => Promise<boolean>;
  logout: () => Promise<void>;
  ensureValidToken: () => Promise<boolean>;
  isExpired: boolean;
  minutesUntilExpiry: number | null;
}

// Create auth context
const AuthContext = createContext<AuthContextValue | null>(null);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
  onLoginRequired?: () => void;
  onTokenRefreshed?: () => void;
  onRefreshFailed?: (error: any) => void;
}

/**
 * AuthProvider Component
 * Wraps the app to provide authentication state
 */
export function AuthProvider({
  children,
  onLoginRequired,
  onTokenRefreshed,
  onRefreshFailed
}: AuthProviderProps) {
  const dispatch = useAppDispatch();
  const authState = useAuthGuard({
    checkOnMount: true,
    autoRefresh: true,
    onLoginRequired,
    onTokenRefreshed,
    onRefreshFailed,
  });

  // ✅ NEW: Synchronize AuthGuard state with Redux store
  useEffect(() => {
    console.log('🔄 Synchronizing AuthGuard state with Redux:', {
      isAuthenticated: authState.isAuthenticated,
      isLoading: authState.isLoading,
    });

    dispatch(setAuthenticationState({
      isAuthenticated: authState.isAuthenticated,
      isLoading: authState.isLoading,
    }));
  }, [authState.isAuthenticated, authState.isLoading, dispatch]);

  // Log auth state changes for debugging
  useEffect(() => {
    if (__DEV__) {
      console.log('Auth state changed:', {
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading,
        needsRefresh: authState.needsRefresh,
        minutesUntilExpiry: authState.minutesUntilExpiry,
      });
    }
  }, [authState.isAuthenticated, authState.isLoading, authState.needsRefresh, authState.minutesUntilExpiry]);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 * Access authentication state from any component
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * withAuth HOC
 * Wrap components that require authentication
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    redirectOnUnauthenticated?: boolean;
    showLoading?: boolean;
  } = {}
) {
  const { redirectOnUnauthenticated = true, showLoading = true } = options;

  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading && showLoading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <div>Loading...</div>
        </div>
      );
    }

    if (!isAuthenticated && redirectOnUnauthenticated) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <div>Please log in to access this page</div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

/**
 * AuthGuard Component
 * Conditionally render children based on auth state
 */
interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ 
  children, 
  fallback = <div>Please log in</div>, 
  requireAuth = true 
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }

  if (!requireAuth && isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Export types
export type { AuthContextValue, AuthProviderProps };

// Export component as default
export default AuthProvider;
