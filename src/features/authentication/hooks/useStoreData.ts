import { useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storeService } from '../services/storeService';
import { STORAGE_KEYS } from '@/shared/config/env';
import type { StoreMyDataResponse } from '../types/store';

const HAS_STORE_KEY = STORAGE_KEYS.USER_PREFERENCES + ':has_store';

/**
 * Storage utilities for hasStore flag
 */
export const getPersistedHasStore = async (): Promise<boolean | undefined> => {
  try {
    const value = await AsyncStorage.getItem(HAS_STORE_KEY);
    return value ? JSON.parse(value) : undefined;
  } catch (error) {
    console.error('Error getting persisted hasStore:', error);
    return undefined;
  }
};

export const setPersistedHasStore = async (hasStore: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(HAS_STORE_KEY, JSON.stringify(hasStore));
  } catch (error) {
    console.error('Error setting persisted hasStore:', error);
  }
};

export const clearPersistedHasStore = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(HAS_STORE_KEY);
  } catch (error) {
    console.error('Error clearing persisted hasStore:', error);
  }
};

/**
 * Query keys for store data
 */
export const STORE_QUERY_KEYS = {
  all: ['store'] as const,
  storeData: () => [...STORE_QUERY_KEYS.all, 'data'] as const,
  hasStore: () => [...STORE_QUERY_KEYS.all, 'hasStore'] as const,
} as const;

/**
 * Hook to get and cache store data from getStoreData API
 * Returns store data and hasStore flag based on API response
 */
export const useStoreData = () => {
  const queryClient = useQueryClient();

  // First check if we have cached data
  const cachedData = queryClient.getQueryData(STORE_QUERY_KEYS.storeData()) as StoreMyDataResponse | undefined;

  // Check AsyncStorage for hasStore flag to conditionally enable the query
  const { data: hasStoreFromStorage } = useQuery({
    queryKey: ['store', 'hasStoreFromStorage'],
    queryFn: async (): Promise<boolean | undefined> => {
      return await getPersistedHasStore();
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const {
    data: storeResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: STORE_QUERY_KEYS.storeData(),
    queryFn: async (): Promise<StoreMyDataResponse> => {
      console.log('🔄 [useStoreData] Fetching store data from API...');
      try {
        const response = await storeService.getStoreData();
        console.log('📦 [useStoreData] API response:', {
          success: response.success,
          message: response.message,
          hasData: !!response.data,
          dataName: response.data?.name,
          code: response.code
        });

        // Update async storage based on API response
        const hasStore = response.success === true;
        await setPersistedHasStore(hasStore);
        console.log('💾 [useStoreData] Updated hasStore in AsyncStorage:', hasStore);

        // Invalidate the hasStoreFromStorage query to pick up the new value
        queryClient.invalidateQueries({ queryKey: ['store', 'hasStoreFromStorage'] });

        return response;
      } catch (error: any) {
        console.error('❌ [useStoreData] API call failed:', error);

        // If API fails (404, network error, etc.), assume user has no store
        await setPersistedHasStore(false);
        console.log('💾 [useStoreData] Set hasStore to false in AsyncStorage due to API error');

        // Invalidate the hasStoreFromStorage query to pick up the new value
        queryClient.invalidateQueries({ queryKey: ['store', 'hasStoreFromStorage'] });

        // Return a failed response structure
        return {
          success: false,
          message: error?.message || 'Failed to fetch store data',
          data: null,
          code: error?.response?.status || 500
        } as StoreMyDataResponse;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (store not found) or 403 (forbidden)
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        console.log('🚫 [useStoreData] Not retrying on 404/403 error');
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    // Only enable if hasStoreFromStorage is explicitly true (not undefined)
    // This prevents store API calls when user is not a store user
    enabled: hasStoreFromStorage === true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Use cached data if available, otherwise use fetched data
  const finalStoreResponse = cachedData || storeResponse;

  // Extract hasStore flag - prioritize AsyncStorage, then API response
  // If AsyncStorage says false, user definitely has no store
  // If AsyncStorage is undefined, use API response
  const hasStore = hasStoreFromStorage !== undefined ? hasStoreFromStorage : (finalStoreResponse ? (finalStoreResponse.success === true) : undefined);
  const storeData = finalStoreResponse?.success ? finalStoreResponse.data : null;

  return {
    storeData,
    hasStore,
    isLoading,
    error,
    refetch,
    // Expose the raw response for debugging
    storeResponse: finalStoreResponse,
  };
};

/**
 * Hook to get hasStore flag with AsyncStorage fallback
 * Uses React Query for caching and AsyncStorage for persistence
 */
export const useHasStore = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: STORE_QUERY_KEYS.hasStore(),
    queryFn: async (): Promise<boolean> => {
      // First try to get from AsyncStorage
      const persistedHasStore = await getPersistedHasStore();
      if (persistedHasStore !== undefined) {
        return persistedHasStore;
      }

      // If not in AsyncStorage, fetch from API
      try {
        const response = await storeService.getStoreData();
        const hasStore = response.success === true;

        // Persist to AsyncStorage for future use
        await setPersistedHasStore(hasStore);
        // Invalidate the hasStore query to pick up the new value
        queryClient.invalidateQueries({ queryKey: STORE_QUERY_KEYS.hasStore() });

        return hasStore;
      } catch (error) {
        console.error('Error fetching hasStore from API:', error);
        // Set hasStore to false in AsyncStorage when API fails
        await setPersistedHasStore(false);
        // Invalidate the hasStore query to pick up the new value
        queryClient.invalidateQueries({ queryKey: STORE_QUERY_KEYS.hasStore() });
        // Return false as fallback if API fails
        return false;
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - longer stale time for persistent data
    gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep in cache longer
    refetchOnMount: false, // Don't refetch if we have cached data
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'always', // Always refetch when network reconnects
    networkMode: 'offlineFirst', // Use cached data when offline
    retry: 3, // More retries for important data
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

export type UseStoreDataResult = ReturnType<typeof useStoreData>;

/**
 * Utility function to refresh store data from API
 * This can be called from anywhere in the app to force a refresh
 */
export const refreshStoreData = async (queryClient: ReturnType<typeof useQueryClient>) => {
  console.log('🔄 [refreshStoreData] Forcing refresh of store data...');
  try {
    // Invalidate the store data query to force a refetch
    await queryClient.invalidateQueries({ queryKey: STORE_QUERY_KEYS.storeData() });
    console.log('✅ [refreshStoreData] Store data refresh initiated');
  } catch (error) {
    console.error('❌ [refreshStoreData] Error refreshing store data:', error);
  }
};
