/**
 * @format
 */

// Polyfill and runtime guard for crypto.getRandomValues used by `uuid` in React Native
try {
  // Prefer the secure polyfill when available
  require('react-native-get-random-values');
} catch (e) {
  // Fallback: provide a non-cryptographic implementation to avoid crashes
  if (typeof global.crypto === 'undefined' || typeof global.crypto.getRandomValues !== 'function') {
    console.warn('crypto.getRandomValues is not available — using insecure Math.random fallback. Install react-native-get-random-values for secure random values.');
    global.crypto = {
      getRandomValues: (arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      },
    };
  }
}

// Wrap crypto.getRandomValues to handle missing native TurboModule at runtime.
// If the native module call throws (TurboModule missing), fall back to an insecure RNG to avoid crashing the app.
// This also logs a clear hint to developers to install the iOS Pod for secure randomness.
if (typeof global.crypto === 'object' && typeof global.crypto.getRandomValues === 'function') {
  const _origGetRandomValues = global.crypto.getRandomValues;
  global.crypto.getRandomValues = (arr) => {
    try {
      return _origGetRandomValues(arr);
    } catch (e) {
      console.warn('crypto.getRandomValues failed (native module missing). Falling back to insecure Math.random. Install iOS pod `react-native-get-random-values` and run `pod install` to enable secure RNG.');
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }
  };
}

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
