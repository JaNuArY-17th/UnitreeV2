import React from 'react';
import { useBankTypeManager } from '../hooks/useBankTypeManager';

interface BankTypeProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that automatically manages bank type based on user account type
 * This should be placed high in the component tree to ensure bank type is always synced
 * 
 * Usage:
 * ```tsx
 * <BankTypeProvider>
 *   <YourAppContent />
 * </BankTypeProvider>
 * ```
 */
export const BankTypeProvider: React.FC<BankTypeProviderProps> = ({ children }) => {
  // This hook automatically syncs the bank type with user account type
  useBankTypeManager();

  return <>{children}</>;
};

export default BankTypeProvider;
