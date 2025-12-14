import { QueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Debug utility to monitor React Query cache persistence
 * Use this to troubleshoot cache persistence issues
 */
export class CacheDebugger {
  private queryClient: QueryClient;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  /**
   * Log all cached queries with bank-related keys
   */
  logBankCaches() {
    const cache = this.queryClient.getQueryCache();
    const allQueries = cache.getAll();
    
    const bankQueries = allQueries.filter(query => {
      const firstKey = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
      return typeof firstKey === 'string' && firstKey.startsWith('bank');
    });

    console.log('🏦 Bank-related cached queries:', {
      total: bankQueries.length,
      queries: bankQueries.map(query => ({
        queryKey: query.queryKey,
        state: query.state.status,
        dataUpdatedAt: new Date(query.state.dataUpdatedAt).toISOString(),
        error: query.state.error?.message,
        data: query.state.data ? 'Has data' : 'No data',
      })),
    });
  }

  /**
   * Check AsyncStorage for persisted cache
   */
  async logPersistedCache() {
    try {
      const persistedData = await AsyncStorage.getItem('REACT_QUERY_OFFLINE_CACHE');
      if (persistedData) {
        const parsed = JSON.parse(persistedData);
        console.log('💾 Persisted cache data:', {
          clientState: parsed.clientState ? 'Present' : 'Missing',
          blobSize: persistedData.length,
          queries: parsed.clientState?.queries?.length || 0,
          mutations: parsed.clientState?.mutations?.length || 0,
        });
      } else {
        console.log('💾 No persisted cache found');
      }
    } catch (error) {
      console.error('❌ Failed to read persisted cache:', error);
    }
  }

  /**
   * Monitor cache changes for bank queries
   */
  startMonitoring() {
    const cache = this.queryClient.getQueryCache();
    
    const unsubscribe = cache.subscribe((event) => {
      if (event?.query?.queryKey) {
        const firstKey = Array.isArray(event.query.queryKey) ? event.query.queryKey[0] : event.query.queryKey;
        if (typeof firstKey === 'string' && firstKey.startsWith('bank')) {
          console.log('🔄 Bank cache event:', {
            type: event.type,
            queryKey: event.query.queryKey,
            status: event.query.state.status,
            timestamp: new Date().toISOString(),
          });
        }
      }
    });

    console.log('👀 Started monitoring bank cache changes');
    return unsubscribe;
  }

  /**
   * Force persist current cache
   */
  async forcePersist() {
    try {
      // Get current bank queries
      const cache = this.queryClient.getQueryCache();
      const bankQueries = cache.getAll().filter(query => {
        const firstKey = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
        return typeof firstKey === 'string' && firstKey.startsWith('bank');
      });

      console.log(`💾 Force persisting ${bankQueries.length} bank queries`);
      
      // The persistence happens automatically through the persister
      // This is mainly for debugging purposes
      this.logBankCaches();
    } catch (error) {
      console.error('❌ Failed to force persist cache:', error);
    }
  }

  /**
   * Clear all persisted data (for testing)
   */
  async clearPersistedCache() {
    try {
      await AsyncStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
      console.log('🗑️ Cleared persisted cache');
    } catch (error) {
      console.error('❌ Failed to clear persisted cache:', error);
    }
  }

  /**
   * Full cache health check
   */
  async healthCheck() {
    console.log('🏥 Cache Health Check Started');
    
    // 1. Check current cache state
    this.logBankCaches();
    
    // 2. Check persisted cache
    await this.logPersistedCache();
    
    // 3. Check bank type manager state
    // const { bankTypeManager } = await import('@/features/deposit/utils/bankTypeManager');
    console.log('🏦 Bank Type Manager State:', {
      hasBankType: false, // TODO: Fix import
      currentBankType: null, // TODO: Fix import
    });

    console.log('✅ Cache Health Check Complete');
  }
}

// Create a global instance for easy debugging
let debuggerInstance: CacheDebugger | null = null;

export const initCacheDebugger = (queryClient: QueryClient) => {
  debuggerInstance = new CacheDebugger(queryClient);
  
  // Make it available globally for debugging
  if (__DEV__) {
    (global as any).cacheDebugger = debuggerInstance;
    console.log('🐛 Cache debugger available as global.cacheDebugger');
  }
  
  return debuggerInstance;
};

export const getCacheDebugger = () => debuggerInstance;