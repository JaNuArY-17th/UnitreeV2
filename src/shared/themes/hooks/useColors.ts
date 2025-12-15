import { useEffect } from 'react';
import { updateColorsForAccountType } from '../colors';
import { useAppSelector } from '@/shared/hooks/useRedux';
import { selectIsAuthenticated } from '@/features/authentication/store/authSelectors';

/**
 * Hook that listens to authentication changes and updates colors accordingly.
 * Currently sets colors to USER by default for all authenticated users.
 */
export const useAuthBasedColors = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      // Set colors for authenticated users (always USER type now)
      updateColorsForAccountType('USER');
    }
  }, [isAuthenticated]);
};
