import { useEffect } from 'react';
import { useAccountType } from '@/features/authentication/hooks/useAccountType';
import { updateColorsForAccountType } from '../colors';
import { useAppSelector } from '@/shared/hooks/useRedux';
import { selectIsAuthenticated } from '@/features/authentication/store/authSelectors';

/**
 * Hook that listens to account type changes and updates colors accordingly.
 * This ensures colors are updated immediately when account type becomes available
 * (after login and my-data API call).
 * Only runs when user is authenticated to prevent unnecessary API calls.
 */
export const useAuthBasedColors = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { accountType } = useAccountType();

  useEffect(() => {
    if (isAuthenticated && accountType) {
      updateColorsForAccountType(accountType);
    }
  }, [isAuthenticated, accountType]);

  return null; // This hook doesn't return anything, it just manages colors
};

/**
 * Legacy hook for getting colors - kept for backward compatibility
 * but now colors are managed globally by useAuthBasedColors
 */
export const useColors = () => {
  // Colors are now managed globally, so we just return the current colors
  const { getColors } = require('../colors');
  return getColors();
};
