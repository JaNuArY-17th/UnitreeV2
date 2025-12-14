/**
 * useLocationMutations Hook
 * React Query mutations for location CRUD operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { locationService } from '../services/locationService';
import { LOCATION_QUERY_KEYS } from './useLocations';
import type {
  LocationCreateRequest,
  LocationUpdateRequest,
} from '../types/location';

/**
 * Hook to create a new location
 */
export const useCreateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LocationCreateRequest) => {
      return await locationService.createLocation(data);
    },
    onSuccess: () => {
      // Invalidate locations list to refetch
      queryClient.invalidateQueries({
        queryKey: LOCATION_QUERY_KEYS.lists(),
      });
    },
    retry: false, // Don't retry mutations to prevent duplicate creations
  });
};

/**
 * Hook to update a location
 */
export const useUpdateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      locationId,
      data,
    }: {
      locationId: string;
      data: LocationUpdateRequest;
    }) => {
      return await locationService.updateLocation(locationId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate specific location detail
      queryClient.invalidateQueries({
        queryKey: LOCATION_QUERY_KEYS.detail(variables.locationId),
      });
      // Also invalidate locations list
      queryClient.invalidateQueries({
        queryKey: LOCATION_QUERY_KEYS.lists(),
      });
    },
    retry: false,
  });
};

/**
 * Hook to delete a location
 */
export const useDeleteLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (locationId: string) => {
      return await locationService.deleteLocation(locationId);
    },
    onSuccess: (_, locationId) => {
      // Remove location from cache
      queryClient.removeQueries({
        queryKey: LOCATION_QUERY_KEYS.detail(locationId),
      });
      // Invalidate locations list
      queryClient.invalidateQueries({
        queryKey: LOCATION_QUERY_KEYS.lists(),
      });
    },
    retry: false,
  });
};

/**
 * Combined hook for all location mutations
 */
export const useLocationMutations = () => {
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const deleteLocation = useDeleteLocation();

  return {
    createLocation,
    updateLocation,
    deleteLocation,
    // Convenience flags
    isCreating: createLocation.isPending,
    isUpdating: updateLocation.isPending,
    isDeleting: deleteLocation.isPending,
    isMutating:
      createLocation.isPending ||
      updateLocation.isPending ||
      deleteLocation.isPending,
  };
};

