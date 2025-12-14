/**
 * Firebase configuration and initialization utilities
 */
import { getApps, getApp } from '@react-native-firebase/app';

/**
 * Check if Firebase is properly initialized with multiple validation methods
 * @returns boolean indicating if Firebase is ready
 */
export const isFirebaseInitialized = (): boolean => {
  try {
    // Method 1: Check if any apps are available
    const apps = getApps();
    console.log('🔍 Firebase apps check:', {
      appsCount: apps.length,
      appNames: apps.map(app => app.name),
    });
    
    if (apps.length === 0) {
      return false;
    }
    
    // Method 2: Try to get the default app
    try {
      const defaultApp = getApp();
      console.log('🔍 Default Firebase app check:', {
        appName: defaultApp.name,
        hasOptions: !!defaultApp.options,
      });
      return true;
    } catch (appError) {
      console.warn('⚠️ Could not get default Firebase app:', appError);
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking Firebase initialization:', error);
    return false;
  }
};

/**
 * Get Firebase app with safety checks
 * @returns Firebase app instance or null if not available
 */
export const getFirebaseAppSafely = () => {
  try {
    const apps = getApps();
    if (apps.length === 0) {
      console.warn('⚠️ No Firebase apps available');
      return null;
    }
    
    return getApp();
  } catch (error) {
    console.error('❌ Error getting Firebase app:', error);
    return null;
  }
};

/**
 * Wait for Firebase to be initialized with detailed logging
 * @param maxWaitTime Maximum time to wait in milliseconds (default: 10000ms)
 * @returns Promise that resolves when Firebase is ready or rejects on timeout
 */
export const waitForFirebaseInitialization = (maxWaitTime: number = 10000): Promise<void> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let checkCount = 0;
    
    console.log('🔥 Starting Firebase initialization wait...', {
      maxWaitTime,
      timestamp: new Date().toISOString(),
    });
    
    const checkFirebase = () => {
      checkCount++;
      const elapsed = Date.now() - startTime;
      
      console.log(`🔍 Firebase check #${checkCount}:`, {
        elapsed: `${elapsed}ms`,
        maxWaitTime: `${maxWaitTime}ms`,
        timestamp: new Date().toISOString(),
      });
      
      if (isFirebaseInitialized()) {
        console.log('✅ Firebase initialization confirmed!', {
          totalChecks: checkCount,
          totalTime: `${elapsed}ms`,
          timestamp: new Date().toISOString(),
        });
        resolve();
        return;
      }
      
      if (elapsed >= maxWaitTime) {
        console.error('❌ Firebase initialization timeout!', {
          totalChecks: checkCount,
          totalTime: `${elapsed}ms`,
          maxWaitTime: `${maxWaitTime}ms`,
          timestamp: new Date().toISOString(),
        });
        logFirebaseStatus(); // Log final status before rejecting
        reject(new Error(`Firebase initialization timeout after ${maxWaitTime}ms`));
        return;
      }
      
      // Check again in 100ms
      setTimeout(checkFirebase, 100);
    };
    
    checkFirebase();
  });
};

/**
 * Log Firebase initialization status for debugging
 */
export const logFirebaseStatus = () => {
  try {
    const apps = getApps();
    console.log('🔥 Firebase Status:', {
      initialized: apps.length > 0,
      appCount: apps.length,
      appNames: apps.map(app => app.name),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error logging Firebase status:', error);
  }
};
