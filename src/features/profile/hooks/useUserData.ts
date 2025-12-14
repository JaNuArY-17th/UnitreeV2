import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/features/authentication/services/userService';
import type { UserFromAPI } from '@/features/authentication/types';
import { userProfileQueryKeys } from '@/features/authentication/hooks/useUserProfile';
import { useAppSelector } from '@/shared/hooks/useRedux';
import { selectIsAuthenticated } from '@/features/authentication/store/authSelectors';

// Use the same query keys as authentication to ensure cache consistency
export const USER_QUERY_KEYS = {
  userData: userProfileQueryKeys.myData(),
};

/**
 * React Query hook for fetching and caching user data
 * This hook provides cached access to the /iam/v1/users/my-data API
 * Only fetches when user is authenticated to prevent unnecessary 401 errors
 */
export const useUserData = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const query = useQuery({
    queryKey: USER_QUERY_KEYS.userData,
    queryFn: async (): Promise<UserFromAPI> => {
      console.log('🚀 [UserData] Fetching fresh data from API...');
      const response = await userService.getMyData();
      if (!response.success || !response.data) {
        console.error('❌ [UserData] API call failed:', response.message);
        throw new Error(response.message || 'Failed to fetch user data');
      }
      console.log('✅ [UserData] Fresh data fetched successfully');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache for 30 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch if we have cached data - prevents duplicate calls
    enabled: isAuthenticated, // Only fetch when user is authenticated
  });

  return query;
};

/**
 * Hook to invalidate and refetch user data
 */
export const useInvalidateUserData = () => {
  const queryClient = useQueryClient();

  return () => {
    console.log('🔄 [UserData] Invalidating cached user data - next call will fetch fresh data');
    queryClient.invalidateQueries({
      queryKey: USER_QUERY_KEYS.userData
    });
  };
};
