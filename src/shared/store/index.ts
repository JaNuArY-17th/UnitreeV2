import { configureStore } from '@reduxjs/toolkit';
import { useSelector, useDispatch, TypedUseSelectorHook } from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist';
import counterReducer from './slices/counterSlice';
import authReducer, { authPersistConfig } from '@/features/authentication/store/authSlice';
import { middleware } from './middleware';

// Create persisted reducers for slices that need persistence
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

// Configure the store with enhanced setup
export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: persistedAuthReducer, // Use persisted auth reducer
  },
  // Enhanced middleware configuration
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Configure middleware options
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
      },
      immutableCheck: {
        // Customize immutable check if needed
        ignoredPaths: ['_persist'],
      },
    }).concat(middleware),
  // Enhanced devTools configuration
  devTools: __DEV__ ? {
    name: 'ENSOGO ESPay App',
    trace: true,
    traceLimit: 25,
  } : false,
});

// Create persistor for redux-persist
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export hooks
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Export store utilities
export { resetStore, logStoreState, validateStoreState } from './utils';
