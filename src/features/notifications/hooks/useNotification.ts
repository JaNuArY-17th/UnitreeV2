import { useCallback } from 'react';
import { getToken, getMessaging } from '@react-native-firebase/messaging';
import { getApp, getApps } from '@react-native-firebase/app';
import { tokenManager } from '@/shared/utils/tokenManager';
import { storeFcmToken } from '@/features/notifications/utils/notificationStorage';
import { requestNotificationPermission } from '@/features/notifications/utils/notificationPermissions';
import { notificationService } from '@/features/notifications/services/notificationService';

/**
 * Helper function to safely get Firebase app with progressive retry logic
 */
const getFirebaseApp = async () => {
	const maxRetries = 5; // Increased retries
	const baseRetryDelay = 1000; // Start with 1 second

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			const apps = getApps();
			console.log(`🔥 Firebase initialization attempt ${attempt}/${maxRetries}:`, {
				availableApps: apps.length,
				appNames: apps.map(app => app.name),
				timestamp: new Date().toISOString(),
			});

			if (apps.length === 0) {
				// Wait longer on early attempts as Firebase might still be initializing
				const waitTime = baseRetryDelay * attempt;
				console.log(`⏳ No Firebase apps found, waiting ${waitTime}ms before retry...`);
				throw new Error(`No Firebase apps initialized (attempt ${attempt}/${maxRetries})`);
			}

			const app = getApp(); // Get default app
			console.log('✅ Firebase app retrieved successfully:', {
				appName: app.name,
				attempt,
				timestamp: new Date().toISOString(),
			});
			return app;
		} catch (error) {
			console.error(`❌ Firebase app retrieval failed (attempt ${attempt}/${maxRetries}):`, error);

			if (attempt === maxRetries) {
				const apps = getApps();
				console.error('🔥 Final Firebase state:', {
					availableApps: apps.length,
					appNames: apps.map(app => app.name),
					errorMessage: error instanceof Error ? error.message : String(error),
					timestamp: new Date().toISOString(),
				});
				throw new Error(`Firebase app not available after ${maxRetries} attempts. This might be a timing issue - try again later or check Firebase configuration.`);
			}

			// Progressive backoff: wait longer on each attempt
			const waitTime = baseRetryDelay * attempt;
			console.log(`⏳ Waiting ${waitTime}ms before retry attempt ${attempt + 1}...`);
			await new Promise<void>(resolve => setTimeout(() => resolve(), waitTime));
		}
	}

	// This should never be reached, but TypeScript requires it
	throw new Error('Unexpected error in Firebase app retrieval');
};

/**
 * Unified notifications hook - handles device registration after login
 * Combines functionality from both useNotifications and useFCMManager
 */
export const useNotification = () => {
	/**
	 * Register device for notifications - unified flow
	 * @returns Promise<boolean> - true if registration successful, false otherwise
	 */
	const registerDevice = useCallback(async (): Promise<boolean> => {
		try {
			// Check if user is authenticated first
			const tokens = await tokenManager.getTokens();
			if (!tokens || !tokens.token) {
				console.log('User not authenticated, skipping FCM registration');
				return false;
			}

			// Request permissions first
			const hasPermission = await requestNotificationPermission();
			if (!hasPermission) {
				console.log('Notification permission denied');
				return false;
			}

			// Get Firebase app safely with retry logic
			const app = await getFirebaseApp();
			const messaging = getMessaging(app);
			const fcmToken = await getToken(messaging);

			if (!fcmToken) {
				console.error('Failed to get FCM token');
				return false;
			}

			console.log('FCM token:', fcmToken);

			// Store token locally
			await storeFcmToken(fcmToken);

			// Register with server
			await notificationService.registerDevice(fcmToken);
			console.log('FCM device registration successful');
			return true;
		} catch (error) {
			console.error('Error registering FCM device:', error);
			return false;
		}
	}, []);

	return {
		registerDevice,
	};
};

// Export alias for backward compatibility
export const useFCMManager = useNotification;