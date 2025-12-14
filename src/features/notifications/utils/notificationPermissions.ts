import { Platform, PermissionsAndroid } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, AuthorizationStatus, requestPermission } from '@react-native-firebase/messaging';
import Geolocation from '@react-native-community/geolocation';

// Configure geolocation
export const configureGeolocation = () => {
  Geolocation.setRNConfiguration({
    skipPermissionRequests: false,
    authorizationLevel: 'whenInUse',
    enableBackgroundLocationUpdates: false,
  });
};

/**
 * Request notification permissions and verify status
 * This function only handles the permission request, not the device registration
 *
 * @returns A promise that resolves to true if permissions were granted, false otherwise
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      // iOS permissions
      const messagingInstance = getMessaging(getApp());
      const authStatus = await requestPermission(messagingInstance, {
        alert: true,
        badge: true,
        sound: true,
        announcement: false,
        carPlay: false,
        provisional: false,
      });

      return authStatus === AuthorizationStatus.AUTHORIZED ||
             authStatus === AuthorizationStatus.PROVISIONAL;
    } else {
      // Android permission check
      // POST_NOTIFICATIONS permission was introduced in Android 13 (API level 33)
      const androidVersion = Platform.Version as number;

      if (androidVersion >= 33) {
        // For Android 13+, explicitly request notification permission
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // For Android 12 and below, notification permissions are granted by default
        return true;
      }
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};
