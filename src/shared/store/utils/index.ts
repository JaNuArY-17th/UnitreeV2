import { store } from '../index';
import type { AppDispatch, RootState } from '../../types/store';

// Store reset functionality for testing and development
export const resetStore = () => {
  // Reset all slices to their initial state
  // This is useful for testing and development
  store.dispatch({ type: 'store/reset' });
};

// Get current store state (for debugging)
export const getStoreState = (): RootState => {
  return store.getState();
};

// Get store dispatch function
export const getStoreDispatch = (): AppDispatch => {
  return store.dispatch;
};

// Store validation utilities
export const validateStoreState = (state: RootState): boolean => {
  try {
    // Add validation logic here
    // For example, check if required fields exist
    if (!state.auth) {
      console.warn('Store validation: auth slice is missing');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Store validation error:', error);
    return false;
  }
};

// Development helpers
export const logStoreState = () => {
  if (__DEV__) {
    console.log('🗄️ Current Store State:', store.getState());
  }
};

export const logStoreActions = (actionTypes: string[]) => {
  if (__DEV__) {
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      const lastAction = (state as any)._lastAction;
      if (lastAction && actionTypes.includes(lastAction.type)) {
        console.log(`🎯 Action Dispatched: ${lastAction.type}`, lastAction);
      }
    });
    return unsubscribe;
  }
  return () => {};
};

// Store hydration helpers (for persistence)
export const isStoreHydrated = (state: RootState): boolean => {
  // Check if persisted state has been loaded
  return !!(state as any)._persist?.rehydrated;
};

// Wait for store hydration
export const waitForHydration = (): Promise<void> => {
  return new Promise((resolve) => {
    const checkHydration = () => {
      const state = store.getState();
      if (isStoreHydrated(state)) {
        resolve();
      } else {
        setTimeout(checkHydration, 10);
      }
    };
    checkHydration();
  });
};