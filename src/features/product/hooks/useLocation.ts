/**
 * useLocation Hook
 * React Query hook for fetching single location details
 */

import { useQuery } from '@tanstack/react-query';
import { locationService } from '../services/locationService';
import { LOCATION_QUERY_KEYS } from './useLocations';

/**
 * Hook to get single location by ID
 * @param locationId - Location ID (required)
 * @param options - React Query options
 */
export const useLocation = (
  locationId: string | undefined,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) => {
  return useQuery({
    queryKey: LOCATION_QUERY_KEYS.detail(locationId || ''),
    queryFn: async () => {
      if (!locationId) {
        throw new Error('Location ID is required');
      }
      return await locationService.getLocationById(locationId);
    },
    enabled: !!locationId && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

