import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = '@ensogo:onboarding_completed';

/**
 * Check if the user has completed onboarding
 * @returns Promise<boolean> - True if onboarding was completed, false if first time
 */
export const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false; // Default to showing onboarding if there's an error
  }
};

/**
 * Mark onboarding as completed
 */
export const setOnboardingCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    console.log('✅ Onboarding marked as completed');
  } catch (error) {
    console.error('Error setting onboarding completed:', error);
  }
};

/**
 * Reset onboarding status (useful for testing or user logout)
 */
export const resetOnboardingStatus = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    console.log('🔄 Onboarding status reset');
  } catch (error) {
    console.error('Error resetting onboarding status:', error);
  }
};
