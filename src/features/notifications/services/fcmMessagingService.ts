import {
  requestPermission,
  getToken,
  onMessage,
  AuthorizationStatus,
  getMessaging,
} from '@react-native-firebase/messaging';

class FCMMessagingService {
  private unsubscribe: (() => void) | null = null;

  async initialize() {
    try {
      console.log('🔄 Initializing FCM messaging service...');

      // Get messaging instance
      const messagingInstance = getMessaging();

      // Request permission for iOS
      const authStatus = await requestPermission(messagingInstance);
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ FCM permission granted');

        // Get FCM token
        const fcmToken = await getToken(messagingInstance);
        console.log('📱 FCM Token:', fcmToken);

        // Listen for foreground messages
        this.unsubscribe = onMessage(messagingInstance, async (remoteMessage) => {
          console.log('📨 Foreground message received:', remoteMessage);

          // Notification display and navigation is handled by useNotificationNavigation hook
          // Just log the message for debugging
        });

        console.log('✅ FCM messaging service initialized');
      } else {
        console.log('❌ FCM permission denied');
      }
    } catch (error) {
      console.error('❌ FCM initialization error:', error);
    }
  }

  async cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
      console.log('🧹 FCM messaging service cleaned up');
    }
  }
}

export const fcmMessagingService = new FCMMessagingService();
