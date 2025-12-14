import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/query-persist-client-core';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define which queries should be persisted
const PERSIST_CACHE_KEYS = [
  'bank', // This will persist all bank-related queries including banks/my
];

// Create the persister
const asyncStoragePersistor = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'REACT_QUERY_OFFLINE_CACHE',
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});

// Create a client with enhanced cache persistence settings
export const createPersistentQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 24 * 60 * 60 * 1000, // 24 hours (increased from 10 minutes for better persistence)
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Don't refetch on mount if we have cached data
        refetchOnReconnect: 'always', // Refetch when reconnecting to network
        networkMode: 'offlineFirst', // Use cached data when offline
      },
      mutations: {
        retry: false,
        networkMode: 'online', // Only run mutations when online
      },
    },
  });

  // Configure persistence
  try {
    persistQueryClient({
      queryClient,
      persister: asyncStoragePersistor,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      // Only persist specific cache keys
      dehydrateOptions: {
        shouldDehydrateQuery: (query) => {
          const queryKey = query.queryKey;
          const firstKey = Array.isArray(queryKey) ? queryKey[0] : queryKey;

          // Persist bank-related queries
          if (typeof firstKey === 'string' && PERSIST_CACHE_KEYS.some(key => firstKey.startsWith(key))) {
            return true;
          }

          return false;
        },
      },
      hydrateOptions: {
        // Optional: Transform data when rehydrating
        defaultOptions: {
          queries: {
            gcTime: 24 * 60 * 60 * 1000, // Ensure long cache time for persisted data
          },
        },
      },
    });
  } catch (error) {
    console.error('Failed to setup query cache persistence:', error);
  }

  return queryClient;
};

// Enhanced bank query configuration with stale-while-revalidate pattern
// Shows cached data immediately but refreshes in background when stale
export const PERSISTENT_BANK_QUERY_CONFIG = {
  staleTime: 30 * 1000, // 30 seconds - balance is fresh for 30 seconds
  gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep in cache longer
  refetchOnMount: true, // Stale-while-revalidate: show cached, refetch if stale
  refetchOnWindowFocus: false,
  refetchOnReconnect: 'always' as const, // Always refetch when network reconnects
  networkMode: 'offlineFirst' as const, // Use cached data when offline
  retry: 3, // More retries for important bank data
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
};

// Function to manually clear bank cache if needed
export const clearBankCache = async (queryClient: QueryClient) => {
  try {
    await queryClient.invalidateQueries({ queryKey: ['bank'] });
    await asyncStoragePersistor.removeClient();
    console.log('Bank cache cleared successfully');
  } catch (error) {
    console.error('Failed to clear bank cache:', error);
  }
};

// Function to manually persist current cache
export const persistCurrentCache = async (queryClient: QueryClient) => {
  try {
    const dehydratedState = queryClient.getQueryCache().getAll()
      .filter(query => {
        const queryKey = query.queryKey;
        const firstKey = Array.isArray(queryKey) ? queryKey[0] : queryKey;
        return typeof firstKey === 'string' && PERSIST_CACHE_KEYS.some(key => firstKey.startsWith(key));
      });

    console.log(`Manually persisting ${dehydratedState.length} bank queries`);
    // The persistence happens automatically, this is just for debugging
  } catch (error) {
    console.error('Failed to manually persist cache:', error);
  }
};
