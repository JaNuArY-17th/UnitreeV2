import {
  requestPermission,
  getToken,
  onMessage,
  AuthorizationStatus,
  getMessaging,
} from '@react-native-firebase/messaging';
import { getApp, getApps } from '@react-native-firebase/app';

class FCMMessagingService {
  private unsubscribe: (() => void) | null = null;

  /**
   * Helper function to safely get Firebase app with retry logic
   */
  private async getFirebaseApp() {
    const maxRetries = 5;
    const baseRetryDelay = 500;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const apps = getApps();
        if (apps.length === 0) {
          const waitTime = baseRetryDelay * attempt;
          console.log(`⏳ No Firebase apps found, waiting ${waitTime}ms before retry...`);
          await new Promise<void>(resolve => setTimeout(() => resolve(), waitTime));
          continue;
        }

        const app = getApp();
        console.log('✅ Firebase app retrieved successfully');
        return app;
      } catch (error) {
        console.error(`❌ Firebase app retrieval failed (attempt ${attempt}/${maxRetries}):`, error);

        if (attempt === maxRetries) {
          throw new Error(`Firebase app not available after ${maxRetries} attempts`);
        }

        const waitTime = baseRetryDelay * attempt;
        await new Promise<void>(resolve => setTimeout(() => resolve(), waitTime));
      }
    }

    throw new Error('Firebase app initialization failed');
  }

  async initialize() {
    try {
      console.log('🔄 Initializing FCM messaging service...');

      // Get Firebase app safely
      const app = await this.getFirebaseApp();
      const messagingInstance = getMessaging(app);

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
