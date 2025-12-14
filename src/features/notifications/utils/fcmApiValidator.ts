/**
 * FCM API Validator - Validates API responses and ensures compatibility
 * Based on the ENSOGO FCM API specification
 */

export interface FCMDeviceRegistration {
  fcm_token: string;
  // Note: Based on actual API testing, only fcm_token and app_id are required
  // device_id, device_name, platform, app_version are not accepted by the API
}

export interface FCMApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export class FCMApiValidator {
  /**
   * Validate device registration payload before sending to API
   * Based on actual API testing: only fcm_token and app_id are required
   */
  static validateRegistrationPayload(payload: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Required fields according to actual API behavior
    if (!payload.fcm_token || typeof payload.fcm_token !== 'string') {
      errors.push('fcm_token is required and must be a string');
    }
    
    // Check for unexpected fields that cause 422 errors
    const allowedFields = ['fcm_token'];
    const unexpectedFields = Object.keys(payload).filter(key => !allowedFields.includes(key));
    if (unexpectedFields.length > 0) {
      errors.push(`Unexpected fields detected (will cause 422 error): ${unexpectedFields.join(', ')}`);
    }
    
    // FCM token format validation (basic)
    if (payload.fcm_token && payload.fcm_token.length < 100) {
      errors.push('fcm_token appears to be invalid (too short)');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate API response structure
   */
  static validateApiResponse(response: any, expectedType: 'register' | 'remove' | 'list'): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!response) {
      errors.push('Response is null or undefined');
      return { valid: false, errors };
    }
    
    // Common response validation
    if (typeof response !== 'object') {
      errors.push('Response must be an object');
    }
    
    // Specific validation based on endpoint type
    switch (expectedType) {
      case 'list':
        if (response.data && !Array.isArray(response.data)) {
          errors.push('List response data should be an array');
        }
        break;
        
      case 'register':
      case 'remove':
        // These typically return success/error messages
        if (!response.success && !response.message && !response.error) {
          errors.push('Response should contain success status or message');
        }
        break;
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate FCM token format
   */
  static validateFCMToken(token: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!token) {
      errors.push('FCM token is required');
      return { valid: false, errors };
    }
    
    if (typeof token !== 'string') {
      errors.push('FCM token must be a string');
    }
    
    // Basic format validation
    if (token.length < 100) {
      errors.push('FCM token is too short (minimum 100 characters expected)');
    }
    
    if (token.length > 1000) {
      errors.push('FCM token is too long (maximum 1000 characters expected)');
    }
    
    // Check for valid characters (base64-like)
    const validTokenPattern = /^[A-Za-z0-9_-]+$/;
    if (!validTokenPattern.test(token.replace(/:/g, ''))) {
      errors.push('FCM token contains invalid characters');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate device information
   */
  static validateDeviceInfo(deviceInfo: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!deviceInfo) {
      errors.push('Device info is required');
      return { valid: false, errors };
    }
    
    // Device ID validation
    if (!deviceInfo.device_id || typeof deviceInfo.device_id !== 'string') {
      errors.push('device_id is required and must be a string');
    }
    
    // Device name validation
    if (!deviceInfo.device_name || typeof deviceInfo.device_name !== 'string') {
      errors.push('device_name is required and must be a string');
    }
    
    // Platform validation
    if (!deviceInfo.platform || !['ios', 'android'].includes(deviceInfo.platform.toLowerCase())) {
      errors.push('platform must be either "ios" or "android"');
    }
    
    // App version validation
    if (!deviceInfo.app_version || typeof deviceInfo.app_version !== 'string') {
      errors.push('app_version is required and must be a string');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get API endpoint URLs for reference
   */
  static getApiEndpoints() {
    return {
      register: 'POST /iam/v1/devices/token',
      remove: 'DELETE /iam/v1/devices/token',
      removeAll: 'DELETE /iam/v1/devices/all',
      list: 'GET /iam/v1/devices',
    };
  }

  /**
   * Get required payload structure for registration
   * Based on actual API testing: only fcm_token and app_id are required
   */
  static getRegistrationPayloadStructure(): FCMDeviceRegistration {
    return {
      fcm_token: 'string (FCM token from Firebase)',
      // Note: device_id, device_name, platform, app_version are NOT accepted by the API
    };
  }
}

// Export convenience functions
export const validateRegistrationPayload = FCMApiValidator.validateRegistrationPayload;
export const validateApiResponse = FCMApiValidator.validateApiResponse;
export const validateFCMToken = FCMApiValidator.validateFCMToken;
export const validateDeviceInfo = FCMApiValidator.validateDeviceInfo;