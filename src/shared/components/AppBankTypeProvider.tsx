import React from 'react';
import { useBankTypeManager } from '@/features/deposit/hooks/useBankTypeManager';
import { useAppSelector } from '@/shared/hooks/useRedux';
import { selectIsAuthenticated } from '@/features/authentication/store/authSelectors';

interface AppBankTypeProviderProps {
  children: React.ReactNode;
}

/**
 * App-level provider that automatically manages bank type based on user authentication state
 * This should be placed in the root of the app to ensure bank type is always synced
 * Only activates when user is authenticated to avoid unnecessary API calls
 * 
 * Usage:
 * ```tsx
 * <AppBankTypeProvider>
 *   <App />
 * </AppBankTypeProvider>
 * ```
 */
export const AppBankTypeProvider: React.FC<AppBankTypeProviderProps> = ({ children }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  // Only initialize bank type manager when user is authenticated
  // This hook automatically syncs bank type with user account type from my-data API
  if (isAuthenticated) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useBankTypeManager();
  }

  return <>{children}</>;
};

export default AppBankTypeProvider;
