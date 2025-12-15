import { useEffect, useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  getMessaging,
  getInitialNotification,
  onMessage,
  onNotificationOpenedApp,
  type FirebaseMessagingTypes
} from '@react-native-firebase/messaging';
import { getApp, getApps } from '@react-native-firebase/app';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';
import NotificationToast from '@/features/notifications/components/NotificationToast';
import { useStoreStatusUpdate } from './useStoreStatusUpdate';

/**
 * Helper function to safely get Firebase messaging with retry logic
 * Returns null if Firebase is not available instead of throwing
 */
const getFirebaseMessaging = async () => {
  const maxRetries = 5;
  const baseRetryDelay = 500;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const apps = getApps();
      if (apps.length === 0) {
        const waitTime = baseRetryDelay * attempt;
        console.log(`⏳ No Firebase apps found, waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      const app = getApp();
      const messaging = getMessaging(app);
      console.log('✅ Firebase messaging retrieved successfully');
      return messaging;
    } catch (error) {
      console.error(`❌ Firebase messaging retrieval failed (attempt ${attempt}/${maxRetries}):`, error);

      if (attempt === maxRetries) {
        console.warn('⚠️ Firebase messaging not available after retries - notifications may not work');
        return null;
      }

      const waitTime = baseRetryDelay * attempt;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  console.warn('⚠️ Firebase messaging initialization failed - notifications disabled');
  return null;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Match các route id với tuyến đường trong ứng dụng
const NAVIGATION_CONFIG = {
  home: 'Home',
  watchlist: 'Watchlist',
  market: 'Market',
  trading: 'Trading',
  assets: 'Assets',
  stock: 'StockDetail',
  notification: 'Notification',
  profile: 'Profile',
  deposit: 'Deposit',
  transfer: 'Transfer',
  history: 'History',
  realEstate: 'RealEstateDetail',
  transactionDetail: 'TransactionDetail', // Add TransactionDetail for balance_change notifications
  account: 'Account',
  orderBook: 'OrderBook', // Add OrderBook navigation
} as const;

type NavigationKeys = keyof typeof NAVIGATION_CONFIG;

/**
 * Xây dựng deeplink URL từ dữ liệu thông báo
 */
function buildDeepLinkFromNotificationData(data: any): string | null {
  const route = data?.route as string;
  const id = data?.id;

  if (!route) {
    console.log('No route provided in notification data');
    return null;
  }

  if (!Object.keys(NAVIGATION_CONFIG).includes(route)) {
    console.log(`Route "${route}" is not in the allowed list`);
    return null;
  }

  // Tạo URL với ID nếu có
  if (id) {
    return `ensogo://${route}/${id}`;
  }

  return `ensogo://${route}`;
}

/**
 * Xử lý điều hướng dựa trên URL
 */
const handleNavigation = (url: string, navigation: NavigationProp) => {
  // Bỏ prefix URL nếu có
  const path = url.replace('ensogo://', '');
  const parts = path.split('/');

  // Convert route to match NAVIGATION_CONFIG keys (handle case variations)
  let route = parts[0] as string;
  const id = parts[1];

  // Convert common variations to match config keys
  switch (route.toLowerCase()) {
    case 'transactiondetail':
      route = 'transactionDetail';
      break;
    case 'realestate':
      route = 'realEstate';
      break;
    case 'stockdetail':
      route = 'stock';
      break;
    case 'orderbook':
      route = 'orderBook';
      break;
    case 'account':
      route = 'account';
      break;
    default:
      // Keep as is for other routes
      break;
  }

  const routeKey = route as NavigationKeys;
  const screenName = NAVIGATION_CONFIG[routeKey];

  if (!screenName) {
    console.log(`Screen not found for route: ${String(route)}`);
    return;
  }

  switch (routeKey) {
    case 'stock':
      if (id) {
        // Navigate to stock detail screen with parameters
        navigation.navigate('StockDetail' as any, { stockId: id, stockCode: id });
      } else {
        // Navigate to main tab with Markets screen
        navigation.navigate('MainTabs' as any);
      }
      break;
    case 'realEstate':
      if (id) {
        navigation.navigate('RealEstateDetail' as any, { propertyId: id });
      } else {
        navigation.navigate('MainTabs' as any);
      }
      break;
    case 'transactionDetail':
      if (id) {
        // Navigate to TransactionDetail screen with transaction parameter
        console.log('Navigating to TransactionDetail with ID:', id);
        navigation.navigate('TransactionDetail', { transaction: id });
      } else {
        console.warn('TransactionDetail requires an ID');
      }
      break;
    case 'orderBook':
      // Navigate to OrderBook screen (using direct screen name since route constant doesn't exist)
      console.log('Navigating to OrderBook');
      navigation.navigate('OrderBook' as any);
      break;
    case 'trading':
    case 'assets':
      // Navigate to main tab with Portfolio screen
      navigation.navigate('MainTabs' as any);
      break;
    case 'home':
    case 'watchlist':
    case 'market':
    case 'profile':
      // Navigate to main tab - the tab navigator will handle the specific tab
      navigation.navigate('MainTabs' as any);
      break;
    case 'account':
      // Navigate to Account screen
      navigation.navigate('AccountManagement' as any);
      break;
    default:
      // For other screens, try to navigate directly
      if (screenName) {
        navigation.navigate(screenName as any);
      }
  }
};


/**
 * Hook to handle FCM notification navigation when app is opened from notification
 */
export function useNotificationNavigation(position: 'top' | 'bottom' | 'center' = 'top') {
  const navigation = useNavigation<NavigationProp>();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastTitle, setToastTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [currentDeepLink, setCurrentDeepLink] = useState<string | null>(null);
  const [lastRemoteMessage, setLastRemoteMessage] = useState<FirebaseMessagingTypes.RemoteMessage | null>(null);

  // Hook to handle store status updates from notifications
  useStoreStatusUpdate(lastRemoteMessage);

  const handleNotificationNavigation = useCallback((data?: any, delay = 0) => {
    if (!data) {
      console.warn('No notification data provided');
      return;
    }

    console.log('Full notification data received:', JSON.stringify(data, null, 2));

    const performNavigation = () => {
      try {
        // Handle URL-based navigation (e.g., "TransactionDetail/da6968f2-ed4b-4a42-a332-a0128d37cef0")
        // Check for url in data object (FCM structure has nested data)
        const url = data.url as string;

        if (url) {
          console.log('Handling URL-based navigation:', url);

          // Special handling for direct URL format like "TransactionDetail/id"
          const urlParts = url.split('/');
          if (urlParts.length >= 2 && urlParts[0] === 'TransactionDetail') {
            const transactionId = urlParts[1];
            console.log('Direct TransactionDetail navigation with ID:', transactionId);
            console.log('Navigation object available:', !!navigation);
            console.log('Attempting to navigate to TransactionDetail with params:', { transaction: transactionId });

            try {
              navigation.navigate('TransactionDetail', { transaction: transactionId });
              console.log('✅ Navigation call completed successfully');
            } catch (navError) {
              console.error('❌ Navigation error:', navError);
            }
            return;
          }

          // For other URLs, use the general handler
          handleNavigation(`ensogo://${url}`, navigation);
          return;
        }

        // Handle route + id based navigation (fallback for older notification formats)
        const route = data.route as string;

        if (route) {
          const deepLinkUrl = buildDeepLinkFromNotificationData(data);
          if (deepLinkUrl) {
            handleNavigation(deepLinkUrl, navigation);
          }
        } else {
          console.warn('No route or URL specified in notification data');
          console.log('Available data keys:', Object.keys(data));
        }
      } catch (error) {
        console.error('Error during notification navigation:', error);
      }
    };

    if (delay > 0) {
      setTimeout(performNavigation, delay);
    } else {
      performNavigation();
    }
  }, [navigation]);

  useEffect(() => {
    // Flag to prevent running after unmount
    let isMounted = true;

    const setupMessaging = async () => {
      try {
        // Get messaging instance safely (returns null if Firebase is not available)
        const messaging = await getFirebaseMessaging();

        if (!messaging) {
          console.warn('⚠️ Firebase messaging is not available, skipping notification setup');
          return;
        }

        // Handle notification that opened the app
        const handleInitialNotification = async () => {
          try {
            const initialNotification = await getInitialNotification(messaging);

            if (initialNotification && isMounted) {
              console.log('App opened from notification:', initialNotification);

              // Add delay for app initialization to complete
              handleNotificationNavigation(initialNotification.data, 1000);
            }
          } catch (error) {
            console.error('Error handling initial notification:', error);
          }
        };

        await handleInitialNotification();

        if (!isMounted) return;

        // Handle notifications when app is in foreground
        const unsubscribe = onMessage(messaging, async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
          if (!isMounted) return;

          console.log('Notification received in foreground:', remoteMessage);

          const { notification, data } = remoteMessage;

          // Store remote message for store status update processing
          setLastRemoteMessage(remoteMessage);

          // Show custom toast for notifications
          if (notification?.title || notification?.body) {
            setToastTitle(notification?.title || '');
            setToastMessage(notification?.body || '');
            setToastVisible(true);
          }

          // Handle navigation data for toast
          if (data) {
            console.log('Foreground notification data:', JSON.stringify(data, null, 2));
            // Store deeplink for when toast is pressed
            const url = data.url as string;
            if (url) {
              console.log('Setting current deeplink from URL:', url);
              setCurrentDeepLink(url);
            } else if (data.route) {
              const deepLinkUrl = buildDeepLinkFromNotificationData(data);
              if (deepLinkUrl) {
                setCurrentDeepLink(deepLinkUrl);
              }
            } else {
              console.log('No URL or route found in data. Available keys:', Object.keys(data));
            }
          }
        });

        // Handle notification opened when app is in background
        const unsubscribeOpened = onNotificationOpenedApp(messaging, (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
          if (!isMounted) return;

          console.log('Notification opened from background:', remoteMessage);

          // Store remote message for store status update processing
          setLastRemoteMessage(remoteMessage);

          // Add small delay for navigation stack to be ready
          handleNotificationNavigation(remoteMessage.data, 500);
        });

        return () => {
          unsubscribe();
          unsubscribeOpened();
        };
      } catch (error) {
        console.error('Error setting up Firebase messaging:', error);
      }
    };

    const cleanup = setupMessaging();

    return () => {
      isMounted = false;
      cleanup?.then(cleanupFn => cleanupFn?.());
    };
  }, [navigation, handleNotificationNavigation]);

  // Xử lý khi nhấp vào toast
  const handleToastPress = useCallback(() => {
    if (currentDeepLink) {
      console.log('Toast pressed, navigating to:', currentDeepLink);

      // Check if it's a direct URL format (without ensogo:// prefix)
      if (currentDeepLink.includes('/') && !currentDeepLink.startsWith('ensogo://')) {
        const urlParts = currentDeepLink.split('/');
        if (urlParts.length >= 2 && urlParts[0] === 'TransactionDetail') {
          const transactionId = urlParts[1];
          console.log('Toast: Direct TransactionDetail navigation with ID:', transactionId);
          console.log('Toast: Navigation object available:', !!navigation);

          try {
            navigation.navigate('TransactionDetail', { transaction: transactionId });
            console.log('✅ Toast navigation call completed successfully');
            setCurrentDeepLink(null);
            return;
          } catch (navError) {
            console.error('❌ Toast navigation error:', navError);
            setCurrentDeepLink(null);
            return;
          }
        }
      }

      // For other formats, use the general handler
      const url = currentDeepLink.startsWith('ensogo://') ? currentDeepLink : `ensogo://${currentDeepLink}`;
      handleNavigation(url, navigation);
      setCurrentDeepLink(null);
    }
  }, [currentDeepLink, navigation]);

  return (
    <NotificationToast
      visible={toastVisible}
      title={toastTitle}
      message={toastMessage}
      onHide={() => setToastVisible(false)}
      onPress={currentDeepLink ? handleToastPress : undefined}
      position={position}
    />
  );
}
