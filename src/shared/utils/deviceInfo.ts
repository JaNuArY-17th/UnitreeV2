// src/shared/utils/deviceInfo.ts
import DeviceInfo from 'react-native-device-info';

/**
 * Device information utilities
 */
export class DeviceInfoManager {
  private static deviceId: string | null = null;

  /**
   * Get unique device ID
   * Uses getUniqueId() which provides a consistent identifier across app reinstalls
   */
  static async getDeviceId(): Promise<string> {
    if (this.deviceId) {
      return this.deviceId;
    }

    try {
      // getUniqueId() returns a unique identifier that persists across app reinstalls
      this.deviceId = await DeviceInfo.getUniqueId();
      return this.deviceId;
    } catch (error) {
      console.warn('Failed to get device ID:', error);
      // Fallback to a generated UUID if device ID fails
      this.deviceId = this.generateFallbackId();
      return this.deviceId;
    }
  }

  /**
   * Generate a fallback device ID if native methods fail
   */
  private static generateFallbackId(): string {
    return 'fallback-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get additional device information for headers
   */
  static async getDeviceInfo() {
    try {
      const [deviceId, brand, model, systemVersion, appVersion] = await Promise.all([
        this.getDeviceId(),
        DeviceInfo.getBrand(),
        DeviceInfo.getModel(),
        DeviceInfo.getSystemVersion(),
        DeviceInfo.getVersion(),
      ]);

      return {
        deviceId,
        brand,
        model,
        systemVersion,
        appVersion,
      };
    } catch (error) {
      console.warn('Failed to get device info:', error);
      return {
        deviceId: await this.getDeviceId(),
        brand: 'unknown',
        model: 'unknown',
        systemVersion: 'unknown',
        appVersion: 'unknown',
      };
    }
  }
}