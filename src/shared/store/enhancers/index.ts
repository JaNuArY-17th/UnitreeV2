import { compose } from 'redux';

// Store enhancers for development and production
export const enhancers = [
  // Redux DevTools enhancer (only in development)
  // Note: React Native uses Flipper or React Native Debugger for Redux DevTools
  ...(__DEV__ ? [] : []),
];

// Compose enhancers function
export const composeEnhancers = (...enhancers: any[]) => {
  // In React Native, we use Flipper or React Native Debugger
  // Redux DevTools extension is not available like in web browsers
  return compose(...enhancers);
};

// Development enhancers
export const devEnhancers = [
  // Add development-specific enhancers here
  // For React Native, Redux DevTools are handled by Flipper or React Native Debugger
];

// Production enhancers
export const prodEnhancers = [
  // Add production-specific enhancers here
];