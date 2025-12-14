import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_STATUS_KEY_PREFIX = '@ensogo:biometric_status_';

/**
 * Biometric status stored for each user
 */
export interface StoredBiometricStatus {
  isEnrolled: boolean;
  biometricType?: 'TouchID' | 'FaceID' | 'Biometric' | 'Fingerprint';
  lastUpdated: number; // timestamp
}

/**
 * Get the storage key for a specific user
 * @param userId - The user ID (phone number or user identifier)
 * @returns The AsyncStorage key
 */
const getBiometricStatusKey = (userId: string): string => {
  return `${BIOMETRIC_STATUS_KEY_PREFIX}${userId}`;
};

/**
 * Store biometric enrollment status for a user
 * @param userId - The user ID (phone number)
 * @param status - The biometric status to store
 */
export const storeBiometricStatus = async (
  userId: string,
  status: Omit<StoredBiometricStatus, 'lastUpdated'>
): Promise<void> => {
  try {
    const dataToStore: StoredBiometricStatus = {
      ...status,
      lastUpdated: Date.now(),
    };

    const key = getBiometricStatusKey(userId);
    await AsyncStorage.setItem(key, JSON.stringify(dataToStore));
    console.log('✅ Biometric status stored for user:', userId);
  } catch (error) {
    console.error('Error storing biometric status:', error);
  }
};

/**
 * Get stored biometric enrollment status for a user
 * @param userId - The user ID (phone number)
 * @returns Promise<StoredBiometricStatus | null> - The stored status or null if not found
 */
export const getStoredBiometricStatus = async (
  userId: string
): Promise<StoredBiometricStatus | null> => {
  try {
    const key = getBiometricStatusKey(userId);
    const storedData = await AsyncStorage.getItem(key);

    if (!storedData) {
      return null;
    }

    const parsedData: StoredBiometricStatus = JSON.parse(storedData);
    return parsedData;
  } catch (error) {
    console.error('Error getting stored biometric status:', error);
    return null;
  }
};

/**
 * Check if a user has biometric enabled (quick check without server call)
 * @param userId - The user ID (phone number)
 * @returns Promise<boolean> - True if user has biometric enabled
 */
export const hasBiometricEnabled = async (userId: string): Promise<boolean> => {
  try {
    const storedStatus = await getStoredBiometricStatus(userId);
    return storedStatus?.isEnrolled === true;
  } catch (error) {
    console.error('Error checking biometric status:', error);
    return false;
  }
};

/**
 * Remove stored biometric status for a user (when biometric is disabled or user logs out)
 * @param userId - The user ID (phone number)
 */
export const removeBiometricStatus = async (userId: string): Promise<void> => {
  try {
    const key = getBiometricStatusKey(userId);
    await AsyncStorage.removeItem(key);
    console.log('🗑️ Biometric status removed for user:', userId);
  } catch (error) {
    console.error('Error removing biometric status:', error);
  }
};

/**
 * Update biometric status when it changes (enroll/disable)
 * @param userId - The user ID (phone number)
 * @param isEnrolled - Whether biometric is enrolled
 * @param biometricType - The type of biometric
 */
export const updateBiometricStatus = async (
  userId: string,
  isEnrolled: boolean,
  biometricType?: 'TouchID' | 'FaceID' | 'Biometric' | 'Fingerprint'
): Promise<void> => {
  await storeBiometricStatus(userId, {
    isEnrolled,
    biometricType,
  });
};

/**
 * Clear all biometric status data (useful for testing or complete logout)
 */
export const clearAllBiometricStatus = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const biometricKeys = keys.filter(key => key.startsWith(BIOMETRIC_STATUS_KEY_PREFIX));

    if (biometricKeys.length > 0) {
      await AsyncStorage.multiRemove(biometricKeys);
      console.log('🧹 Cleared all biometric status data');
    }
  } catch (error) {
    console.error('Error clearing biometric status data:', error);
  }
};