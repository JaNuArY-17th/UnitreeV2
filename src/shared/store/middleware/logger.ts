import { Middleware } from '@reduxjs/toolkit';

// Custom logger middleware for development
export const logger: Middleware = (store) => (next) => (action: any) => {
  if (__DEV__) {
    console.group(`🔄 Redux Action: ${action.type}`);
    console.log('Previous State:', store.getState());
    console.log('Action:', action);

    const result = next(action);

    console.log('Next State:', store.getState());
    console.groupEnd();

    return result;
  }

  return next(action);
};

// Action logger for specific actions
export const actionLogger = (actionTypes: string[]) => {
  return ({ getState }: { getState: () => any }) => (next: any) => (action: any) => {
    if (__DEV__ && actionTypes.includes(action.type)) {
      console.log(`🎯 Action Dispatched: ${action.type}`, {
        payload: action.payload,
        timestamp: new Date().toISOString(),
        state: getState(),
      });
    }
    return next(action);
  };
};

// Error logger middleware
export const errorLogger: Middleware = () => (next) => (action) => {
  try {
    return next(action);
  } catch (error) {
    if (__DEV__) {
      console.error('❌ Redux Error:', error);
      console.error('Action that caused error:', action);
    }
    throw error;
  }
};