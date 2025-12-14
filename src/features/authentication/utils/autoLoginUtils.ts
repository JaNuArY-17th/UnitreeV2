import AsyncStorage from '@react-native-async-storage/async-storage';

const REMEMBERED_PHONE_KEY = '@ensogo:remembered_phone';
const AUTO_LOGIN_ENABLED_KEY = '@ensogo:auto_login_enabled';
const USER_TYPE_KEY = '@ensogo:last_user_type';
const REMEMBERED_NAME_KEY = '@ensogo:remembered_name';

/**
 * Remembered login information (for auto login)
 */
export interface RememberedLoginInfo {
  phone_number: string;
  timestamp: number;
}

/**
 * Auto login utility class for managing remembered phone numbers
 */
export class AutoLoginUtils {
  /**
   * Save phone number when auto login is enabled and login is successful
   * @param phoneNumber - The phone number to remember
   */
  static async saveRememberedPhone(phoneNumber: string): Promise<void> {
    try {
      const loginInfo: RememberedLoginInfo = {
        phone_number: phoneNumber,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(REMEMBERED_PHONE_KEY, JSON.stringify(loginInfo));
      console.log('✅ Remembered phone number saved:', phoneNumber);
    } catch (error) {
      console.error('❌ Error saving remembered phone number:', error);
    }
  }

  /**
   * Get the remembered phone number
   * @returns Promise<string | null> - The remembered phone number or null if not found
   */
  static async getRememberedPhone(): Promise<string | null> {
    try {
      const stored = await AsyncStorage.getItem(REMEMBERED_PHONE_KEY);
      console.log('🔍 [AutoLoginUtils] Reading from storage:', REMEMBERED_PHONE_KEY);
      console.log('🔍 [AutoLoginUtils] Stored value:', stored);
      if (!stored) {
        console.log('⚠️ [AutoLoginUtils] No remembered phone found in storage');
        return null;
      }

      const loginInfo: RememberedLoginInfo = JSON.parse(stored);
      console.log('✅ [AutoLoginUtils] Parsed login info:', loginInfo);
      console.log('✅ [AutoLoginUtils] Returning phone number:', loginInfo.phone_number);
      return loginInfo.phone_number;
    } catch (error) {
      console.error('❌ Error getting remembered phone number:', error);
      return null;
    }
  }

  /**
   * Clear remembered phone number
   */
  static async clearRememberedPhone(): Promise<void> {
    try {
      await AsyncStorage.removeItem(REMEMBERED_PHONE_KEY);
      console.log('✅ Remembered phone number cleared');
    } catch (error) {
      console.error('❌ Error clearing remembered phone number:', error);
    }
  }

  /**
   * Check if a phone number is different from the remembered one
   * @param phoneNumber - The phone number to check
   * @returns Promise<boolean> - True if different or no remembered phone exists
   */
  static async isPhoneNumberDifferent(phoneNumber: string): Promise<boolean> {
    try {
      const rememberedPhone = await this.getRememberedPhone();
      return !rememberedPhone || rememberedPhone !== phoneNumber;
    } catch (error) {
      console.error('❌ Error checking phone number difference:', error);
      return true; // Default to true for safety
    }
  }

  /**
   * Save auto login enabled state
   * @param enabled - Whether auto login is enabled
   */
  static async setAutoLoginEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTO_LOGIN_ENABLED_KEY, JSON.stringify(enabled));
      console.log('✅ Auto login enabled state saved:', enabled);
    } catch (error) {
      console.error('❌ Error saving auto login enabled state:', error);
    }
  }

  /**
   * Get auto login enabled state
   * @returns Promise<boolean> - Whether auto login is enabled
   */
  static async getAutoLoginEnabled(): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem(AUTO_LOGIN_ENABLED_KEY);
      return stored ? JSON.parse(stored) : false;
    } catch (error) {
      console.error('❌ Error getting auto login enabled state:', error);
      return false;
    }
  }

  /**
   * Save last used user type (always save, regardless of auto login)
   * @param userType - The user type ('store' or 'user')
   */
  static async saveLastUserType(userType: 'store' | 'user'): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_TYPE_KEY, userType);
      console.log('✅ Last user type saved:', userType);
    } catch (error) {
      console.error('❌ Error saving last user type:', error);
    }
  }

  /**
   * Get last used user type
   * @returns Promise<'store' | 'user' | null> - The last used user type or null
   */
  static async getLastUserType(): Promise<'store' | 'user' | null> {
    try {
      const userType = await AsyncStorage.getItem(USER_TYPE_KEY);
      console.log('🔍 Last user type from storage:', userType);
      return userType as 'store' | 'user' | null;
    } catch (error) {
      console.error('❌ Error getting last user type:', error);
      return null;
    }
  }

  /**
   * Save remembered name
   * @param name - The name to remember
   */
  static async saveRememberedName(name: string): Promise<void> {
    try {
      await AsyncStorage.setItem(REMEMBERED_NAME_KEY, name);
      console.log('✅ Remembered name saved:', name);
    } catch (error) {
      console.error('❌ Error saving remembered name:', error);
    }
  }

  /**
   * Get the remembered name
   * @returns Promise<string | null> - The remembered name or null if not found
   */
  static async getRememberedName(): Promise<string | null> {
    try {
      const name = await AsyncStorage.getItem(REMEMBERED_NAME_KEY);
      return name;
    } catch (error) {
      console.error('❌ Error getting remembered name:', error);
      return null;
    }
  }

  /**
   * Clear remembered name
   */
  static async clearRememberedName(): Promise<void> {
    try {
      await AsyncStorage.removeItem(REMEMBERED_NAME_KEY);
      console.log('✅ Remembered name cleared');
    } catch (error) {
      console.error('❌ Error clearing remembered name:', error);
    }
  }

  /**
   * Handle auto login - save/clear phone based on checkbox
   * @param phoneNumber - The phone number used for login
   * @param autoLoginEnabled - Whether auto login checkbox was checked
   */
  static async handleAutoLogin(phoneNumber: string, autoLoginEnabled: boolean): Promise<void> {
    try {
      if (autoLoginEnabled) {
        // Auto login enabled - check if phone is different
        const isDifferent = await this.isPhoneNumberDifferent(phoneNumber);

        if (isDifferent) {
          // Phone number is different, clear the old one
          await this.clearRememberedPhone();
          console.log('✅ Cleared old remembered phone due to different phone');
        }

        // Save the phone number for auto login
        await this.saveRememberedPhone(phoneNumber);
        await this.setAutoLoginEnabled(true);
        console.log('✅ Auto login enabled, phone saved:', phoneNumber);
      } else {
        // Auto login disabled - clear any remembered phone
        await this.clearRememberedPhone();
        await this.setAutoLoginEnabled(false);
        console.log('✅ Auto login disabled, phone cleared');
      }
    } catch (error) {
      console.error('❌ Error handling auto login:', error);
    }
  }

  /**
   * Handle login success - save user type (always, regardless of auto login)
   * @param userType - The user type ('store' or 'user')
   */
  static async handleLoginSuccess(userType: 'store' | 'user'): Promise<void> {
    try {
      // Always save last user type to remember tab selection
      await this.saveLastUserType(userType);
      console.log('✅ Login success - user type saved:', userType);
    } catch (error) {
      console.error('❌ Error handling login success:', error);
    }
  }

  /**
   * Clear all cached login data (phone, auto login state, user type)
   */
  static async clearAllCacheData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(REMEMBERED_PHONE_KEY),
        AsyncStorage.removeItem(AUTO_LOGIN_ENABLED_KEY),
        AsyncStorage.removeItem(USER_TYPE_KEY),
        AsyncStorage.removeItem(REMEMBERED_NAME_KEY),
      ]);
      console.log('✅ All cached login data cleared');
    } catch (error) {
      console.error('❌ Error clearing all cached login data:', error);
    }
  }

  /**
   * Initialize auto login state - loads remembered phone and auto login state
   * @returns Promise<{phoneNumber: string | null, autoLoginEnabled: boolean}>
   */
  static async initializeAutoLoginState(): Promise<{
    phoneNumber: string | null;
    autoLoginEnabled: boolean;
  }> {
    try {
      const [phoneNumber, autoLoginEnabled] = await Promise.all([
        this.getRememberedPhone(),
        this.getAutoLoginEnabled(),
      ]);

      return {
        phoneNumber,
        autoLoginEnabled,
      };
    } catch (error) {
      console.error('❌ Error initializing auto login state:', error);
      return {
        phoneNumber: null,
        autoLoginEnabled: false,
      };
    }
  }
}

export default AutoLoginUtils;
