import { Platform, NativeModules } from 'react-native';
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';

const { WifiManager } = NativeModules;

export interface WifiInfo {
  ssid: string | null;
  bssid: string | null;
  level?: number; // Android: 0-4 signal level
  rssi?: number; // Signal strength in dBm
}

export interface PermissionResult {
  granted: boolean;
  status: string;
  message?: string;
}

/**
 * Request WiFi/Location permission
 * Required for accessing WiFi information on both iOS and Android
 */
export const requestWiFiPermission = async (): Promise<PermissionResult> => {
  try {
    console.log('🔐 Requesting Location permissions...');

    const permission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    const currentStatus = await check(permission);
    console.log('📍 Current permission status:', currentStatus);

    if (currentStatus === RESULTS.GRANTED) {
      console.log('✅ Location permission already granted');
      return {
        granted: true,
        status: currentStatus,
      };
    }

    const result = await request(permission);
    console.log('🔐 Permission request result:', result);

    if (result === RESULTS.GRANTED) {
      console.log('✅ Location permission granted');
      return {
        granted: true,
        status: result,
      };
    } else if (result === RESULTS.DENIED) {
      console.log('❌ Permission denied');
      return {
        granted: false,
        status: result,
        message: 'Please enable location permission in Settings',
      };
    } else if (result === RESULTS.BLOCKED) {
      console.log('❌ Permission blocked permanently');
      return {
        granted: false,
        status: result,
        message: 'Enable in Settings > Privacy',
      };
    }

    return {
      granted: false,
      status: result,
      message: 'Permission not granted',
    };
  } catch (error) {
    console.error('❌ Error requesting permission:', error);
    return {
      granted: false,
      status: 'error',
      message: 'Error requesting permission',
    };
  }
};

/**
 * Get current WiFi information
 * Requires location permission to be granted
 */
export const getWifiInfo = async (): Promise<WifiInfo> => {
  try {
    console.log('🔍 Fetching WiFi info...');

    let wifiData;
    
    if (Platform.OS === 'ios') {
      // iOS: Use WifiManager
      wifiData = await WifiManager.getWifiInfo();
      console.log('📱 iOS WiFi Info:', wifiData);
    } else {
      // Android: Use WifiModule
      const { WifiModule } = NativeModules;
      wifiData = await WifiModule.getWifiInfo();
      console.log('📱 Android WiFi Info:', wifiData);
      console.log('   RSSI (Cường độ):', wifiData?.rssi);
      console.log('   Level (0-4):', wifiData?.level);
    }
    
    if (wifiData) {
      console.log('✅ SSID:', wifiData.ssid);
      console.log('✅ BSSID:', wifiData.bssid);
      return {
        ssid: wifiData.ssid,
        bssid: wifiData.bssid,
        level: wifiData.level,
        rssi: wifiData.rssi,
      };
    } else {
      console.log('⚠️ Could not get WiFi info. Check Location permission and WiFi is enabled.');
      return {
        ssid: null,
        bssid: null,
      };
    }
  } catch (error) {
    console.error('❌ Error fetching WiFi info:', error);
    throw error;
  }
};

/**
 * Check if WiFi permission is granted
 */
export const checkWiFiPermission = async (): Promise<boolean> => {
  try {
    const permission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    const status = await check(permission);
    return status === RESULTS.GRANTED;
  } catch (error) {
    console.error('Error checking WiFi permission:', error);
    return false;
  }
};
