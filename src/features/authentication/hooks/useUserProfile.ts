// src/features/authentication/hooks/useUserProfile.ts
import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/shared/hooks/useRedux';
import { selectIsAuthenticated } from '../store/authSelectors';
import { userService } from '../services/userService';
import type { UserFromAPI } from '../types/user';

// Query keys for user profile
export const userProfileQueryKeys = {
  all: ['userProfile'] as const,
  profile: () => [...userProfileQueryKeys.all, 'profile'] as const,
  myData: () => [...userProfileQueryKeys.all, 'myData'] as const,
} as const;

/**
 * Hook for managing user profile data with React Query caching
 */
export const useUserProfile = () => {
  const queryClient = useQueryClient();
  const bankProvisionedRef = useRef(false);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Query for user profile data
  const {
    data: userData,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: userProfileQueryKeys.myData(),
    queryFn: async (): Promise<UserFromAPI> => {
      const response = await userService.getMyData();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch user data');
      }
      return response.data;
    },
    enabled: isAuthenticated, // Only run when user is authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection time
    retry: (failureCount, error: any) => {
      // Don't retry if unauthorized
      if (error?.status === 401) {
        return false;
      }
      return failureCount < 2; // Retry up to 2 times
    },
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch - data is cached after login by useTabLogin
  });

  // After user data fetched, invalidate any stale queries
  useEffect(() => {
    // User profile data has been fetched and cached, no additional actions needed
  }, [isAuthenticated, userData, queryClient]);

  // Helper functions
  const invalidateUserProfile = () => {
    return queryClient.invalidateQueries({
      queryKey: userProfileQueryKeys.all
    });
  };

  const setUserProfileData = (data: UserFromAPI) => {
    queryClient.setQueryData(userProfileQueryKeys.myData(), data);
  };

  const clearUserProfileCache = () => {
    queryClient.removeQueries({
      queryKey: userProfileQueryKeys.all
    });
  };

  return {
    // Data
    userData,

    // Loading states
    isLoading,
    isRefetching,

    // Error states
    isError,
    error,

    // Actions
    refetch,
    invalidateUserProfile,
    setUserProfileData,
    clearUserProfileCache,

    // Computed values
    hasUserData: !!userData,
    userAvatar: userData?.avatar?.file_url || null,
    userDisplayName: userData?.full_name || userData?.phone_number || 'User',
  };
};
