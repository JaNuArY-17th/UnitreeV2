import AsyncStorage from '@react-native-async-storage/async-storage';

const FCM_TOKEN_KEY = '@ensogo:fcm_token';
const TOKEN_REGISTRATION_STATUS_KEY = '@ensogo:fcm_registration_status';
const REGISTRATION_TIMESTAMP_KEY = '@ensogo:fcm_registration_timestamp';
const TOKEN_VALIDATION_KEY = '@ensogo:fcm_token_validation';
const LAST_VALIDATION_TIMESTAMP_KEY = '@ensogo:fcm_last_validation';

/**
 * Store the FCM token in AsyncStorage
 */
export const storeFcmToken = async (token: string): Promise<void> => {
  if (!token) return;
  try {
    await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing FCM token:', error);
  }
};

/**
 * Get the stored FCM token
 */
export const getFcmToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(FCM_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

/**
 * Store the FCM token registration status with the server
 */
export const storeRegistrationStatus = async (isRegistered: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_REGISTRATION_STATUS_KEY, String(isRegistered));
    if (isRegistered) {
      // Store timestamp when successfully registered
      await AsyncStorage.setItem(REGISTRATION_TIMESTAMP_KEY, Date.now().toString());
    }
  } catch (error) {
    console.error('Error storing FCM registration status:', error);
  }
};

/**
 * Get the FCM token registration status
 */
export const getRegistrationStatus = async (): Promise<boolean> => {
  try {
    const status = await AsyncStorage.getItem(TOKEN_REGISTRATION_STATUS_KEY);
    return status === 'true';
  } catch (error) {
    console.error('Error getting FCM registration status:', error);
    return false;
  }
};

/**
 * Check if the token needs to be re-registered with the server
 * Returns true if registration was done more than 7 days ago or has never been done
 */
export const shouldRefreshRegistration = async (): Promise<boolean> => {
  try {
    const timestamp = await AsyncStorage.getItem(REGISTRATION_TIMESTAMP_KEY);
    if (!timestamp) return true;

    const registrationTime = parseInt(timestamp, 10);
    const now = Date.now();
    // Re-register after 7 days
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    return now - registrationTime > SEVEN_DAYS_MS;
  } catch (error) {
    console.error('Error checking registration timestamp:', error);
    return true; // If we can't determine, assume we need to register
  }
};

/**
 * Store token validation status
 */
export const storeTokenValidation = async (isValid: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_VALIDATION_KEY, String(isValid));
    await AsyncStorage.setItem(LAST_VALIDATION_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error storing token validation:', error);
  }
};

/**
 * Get token validation status
 */
export const getTokenValidation = async (): Promise<boolean> => {
  try {
    const validation = await AsyncStorage.getItem(TOKEN_VALIDATION_KEY);
    return validation === 'true';
  } catch (error) {
    console.error('Error getting token validation:', error);
    return false;
  }
};

/**
 * Check if token validation is stale (older than 1 hour)
 */
export const isTokenValidationStale = async (): Promise<boolean> => {
  try {
    const timestamp = await AsyncStorage.getItem(LAST_VALIDATION_TIMESTAMP_KEY);
    if (!timestamp) return true;

    const validationTime = parseInt(timestamp, 10);
    const now = Date.now();
    const ONE_HOUR_MS = 60 * 60 * 1000;

    return now - validationTime > ONE_HOUR_MS;
  } catch (error) {
    console.error('Error checking token validation staleness:', error);
    return true;
  }
};

/**
 * Get comprehensive FCM storage status for debugging
 */
export const getFCMStorageStatus = async () => {
  try {
    const [
      token,
      isRegistered,
      registrationTimestamp,
      isValidated,
      validationTimestamp
    ] = await AsyncStorage.multiGet([
      FCM_TOKEN_KEY,
      TOKEN_REGISTRATION_STATUS_KEY,
      REGISTRATION_TIMESTAMP_KEY,
      TOKEN_VALIDATION_KEY,
      LAST_VALIDATION_TIMESTAMP_KEY
    ]);

    return {
      hasToken: !!token[1],
      tokenLength: token[1]?.length || 0,
      isRegistered: isRegistered[1] === 'true',
      registrationAge: registrationTimestamp[1] 
        ? Date.now() - parseInt(registrationTimestamp[1], 10) 
        : null,
      isValidated: isValidated[1] === 'true',
      validationAge: validationTimestamp[1] 
        ? Date.now() - parseInt(validationTimestamp[1], 10) 
        : null,
      needsRefresh: await shouldRefreshRegistration(),
      validationStale: await isTokenValidationStale(),
    };
  } catch (error) {
    console.error('Error getting FCM storage status:', error);
    return null;
  }
};

/**
 * Clear all notification storage data
 */
export const clearNotificationStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      FCM_TOKEN_KEY,
      TOKEN_REGISTRATION_STATUS_KEY,
      REGISTRATION_TIMESTAMP_KEY,
      TOKEN_VALIDATION_KEY,
      LAST_VALIDATION_TIMESTAMP_KEY,
      '@ensogo:fcm_should_register_on_login' // Clear login flag as well
    ]);
    console.log('All FCM storage data cleared');
  } catch (error) {
    console.error('Error clearing notification storage:', error);
  }
};
