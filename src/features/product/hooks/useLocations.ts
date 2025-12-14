/**
 * useLocations Hook
 * React Query hook for fetching and managing locations list
 */

import { useQuery } from '@tanstack/react-query';
import { locationService } from '../services/locationService';
import type { LocationListParams } from '../types/location';

/**
 * Query keys for locations
 */
export const LOCATION_QUERY_KEYS = {
  all: ['locations'] as const,
  lists: () => [...LOCATION_QUERY_KEYS.all, 'list'] as const,
  list: (params?: LocationListParams) =>
    [...LOCATION_QUERY_KEYS.lists(), params] as const,
  details: () => [...LOCATION_QUERY_KEYS.all, 'detail'] as const,
  detail: (locationId: string) =>
    [...LOCATION_QUERY_KEYS.details(), locationId] as const,
} as const;

/**
 * Hook to get locations list with pagination
 * @param params - Query parameters (page, size, searchTerm)
 * @param options - React Query options
 */
export const useLocations = (
  params?: LocationListParams,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchOnMount?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) => {
  return useQuery({
    queryKey: LOCATION_QUERY_KEYS.list(params),
    queryFn: async () => {
      return await locationService.getLocations(params);
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    refetchOnMount: options?.refetchOnMount ?? false,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 or 403
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

