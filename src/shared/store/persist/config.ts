import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistStore, persistReducer, PersistConfig } from 'redux-persist';
import { createTransform } from 'redux-persist';

// Create AsyncStorage storage engine for redux-persist
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('AsyncStorage getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('AsyncStorage setItem error:', error);
      throw error;
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('AsyncStorage removeItem error:', error);
      throw error;
    }
  },
};

// Transform to handle undefined values
const transform = createTransform(
  // Transform state on its way to being serialized and persisted
  (inboundState: any) => inboundState,
  // Transform state being rehydrated
  (outboundState: any) => outboundState,
  // Configuration
  { whitelist: ['auth'] }
);

// Persist configuration for the entire store
export const persistConfig: PersistConfig<any> = {
  key: 'root',
  storage,
  // Only persist specific slices, not the entire state
  whitelist: ['auth'], // Only persist auth state for now
  // Blacklist temporary states that shouldn't be persisted
  blacklist: ['counter'], // Counter is just for demo, don't persist
  // Customize serialization if needed
  serialize: true,
  // Timeout for storage operations
  timeout: 10000,
  // Transform data
  transforms: [transform],
};

// Persist configuration for individual slices
export const authPersistConfig: PersistConfig<any> = {
  key: 'auth',
  storage,
  // Only persist essential auth data, not loading states
  whitelist: ['user', 'accessToken', 'refreshToken', 'isAuthenticated'],
  blacklist: ['isLoading', 'error'],
  // Timeout for storage operations
  timeout: 10000,
};

// Helper function to create a persisted reducer
export const createPersistedReducer = (config: PersistConfig<any>, reducer: any) => {
  return persistReducer(config, reducer);
};

// Export persistor for store integration
export { persistStore };