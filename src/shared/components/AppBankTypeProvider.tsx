import React from 'react';
import { useAppSelector } from '@/shared/hooks/useRedux';
import { selectIsAuthenticated } from '@/features/authentication/store/authSelectors';

interface AppBankTypeProviderProps {
  children: React.ReactNode;
}

/**
 * App-level provider placeholder
 * Previously used for bank type management - now deprecated
 */
export const AppBankTypeProvider: React.FC<AppBankTypeProviderProps> = ({ children }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return <>{children}</>;
};

export default AppBankTypeProvider;
