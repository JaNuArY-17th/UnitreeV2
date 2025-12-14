import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
// import { getCacheDebugger } from '@/shared/utils/cacheDebugger';

/**
 * Hook to validate and restore cache persistence on app startup
 * This helps ensure bank data is properly restored after app reload
 */
export const useCachePersistenceValidator = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const validateCache = async () => {
      if (__DEV__) {
        console.log('🔍 Validating cache persistence on app startup...');
        
        console.log('✅ Cache persistence validation started');
      }

      // Check if we have any bank-related cache
      const cache = queryClient.getQueryCache();
      const bankQueries = cache.getAll().filter(query => {
        const firstKey = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
        return typeof firstKey === 'string' && firstKey.startsWith('bank');
      });

      if (bankQueries.length > 0) {
        console.log(`✅ Found ${bankQueries.length} cached bank queries on startup`);
        
        // Log the cached data for debugging
        bankQueries.forEach(query => {
          if (query.state.data) {
            console.log(`📦 Restored cache for ${JSON.stringify(query.queryKey)}`);
          }
        });
      } else {
        console.log('ℹ️ No bank cache found on startup - will fetch fresh data');
      }
    };

    // Run validation after a short delay to allow cache hydration
    const timeoutId = setTimeout(validateCache, 1000);

    return () => clearTimeout(timeoutId);
  }, [queryClient]);
};

/**
 * Hook to monitor cache persistence issues
 * Reports when queries are unexpectedly refetched due to missing cache
 */
export const useCachePersistenceMonitor = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!__DEV__) return;

    const cache = queryClient.getQueryCache();
    
    const unsubscribe = cache.subscribe((event) => {
      if (event?.query?.queryKey) {
        const firstKey = Array.isArray(event.query.queryKey) ? event.query.queryKey[0] : event.query.queryKey;
        
        if (typeof firstKey === 'string' && firstKey.startsWith('bank')) {
          // Monitor for unexpected fetches that might indicate cache loss
          if (event.type === 'observerAdded' && event.query.state.status === 'pending') {
            console.log('🔄 Bank query started fetching:', {
              queryKey: event.query.queryKey,
              hadCachedData: !!event.query.state.data,
              dataAge: event.query.state.dataUpdatedAt ? 
                Date.now() - event.query.state.dataUpdatedAt : 'never',
            });
          }
          
          // Monitor successful data fetches
          if (event.type === 'updated' && event.query.state.status === 'success' && event.query.state.data) {
            console.log('✅ Bank query completed successfully:', {
              queryKey: event.query.queryKey,
              dataSize: JSON.stringify(event.query.state.data).length,
            });
          }
          
          // Monitor errors
          if (event.type === 'updated' && event.query.state.status === 'error') {
            console.error('❌ Bank query failed:', {
              queryKey: event.query.queryKey,
              error: event.query.state.error?.message,
            });
          }
        }
      }
    });

    console.log('👀 Started monitoring cache persistence');
    return unsubscribe;
  }, [queryClient]);
};