/**
 * Native Module Safety Wrapper
 * 
 * This utility helps handle cases where native modules might not be properly
 * initialized in Hermes, causing "Cannot read property 'getConstants' of null" errors.
 */

interface NativeModule {
  getConstants?: () => any;
  [key: string]: any;
}

/**
 * Safely access native module constants with fallback
 * @param module The native module to access
 * @param fallbackConstants Default constants to use if module is not available
 * @returns Constants object or fallback
 */
export const safeGetConstants = (module: NativeModule | null, fallbackConstants: any = {}) => {
  try {
    if (module && typeof module.getConstants === 'function') {
      const constants = module.getConstants();
      return constants || fallbackConstants;
    }
  } catch (error) {
    console.warn('SafeGetConstants: Failed to get constants from module', error);
  }
  return fallbackConstants;
};

/**
 * Safely call a native module method with error handling
 * @param module The native module
 * @param methodName Name of the method to call
 * @param args Arguments to pass to the method
 * @param fallbackResult Result to return if method fails
 */
export const safeCallNativeMethod = async (
  module: any,
  methodName: string,
  args: any[] = [],
  fallbackResult: any = null
) => {
  try {
    if (module && typeof module[methodName] === 'function') {
      return await module[methodName](...args);
    } else {
      console.warn(`SafeCallNativeMethod: Method ${methodName} not available on module`);
      return fallbackResult;
    }
  } catch (error) {
    console.warn(`SafeCallNativeMethod: Error calling ${methodName}:`, error);
    return fallbackResult;
  }
};

/**
 * Check if a native module is properly initialized
 * @param module The native module to check
 * @returns boolean indicating if module is ready
 */
export const isNativeModuleReady = (module: any): boolean => {
  try {
    return module !== null && module !== undefined && typeof module === 'object';
  } catch (error) {
    console.warn('isNativeModuleReady: Error checking module readiness:', error);
    return false;
  }
};

/**
 * Wait for native module to be ready with timeout
 * @param getModule Function that returns the module
 * @param timeout Timeout in milliseconds
 * @returns Promise that resolves when module is ready or rejects on timeout
 */
export const waitForNativeModule = (
  getModule: () => any,
  timeout: number = 5000
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkModule = () => {
      try {
        const module = getModule();
        if (isNativeModuleReady(module)) {
          resolve(module);
          return;
        }
      } catch (error) {
        // Module not ready yet, continue checking
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error(`Native module not ready after ${timeout}ms`));
        return;
      }
      
      setTimeout(checkModule, 100);
    };
    
    checkModule();
  });
};