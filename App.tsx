import { useEffect, useState, useRef } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  ActivityIndicator,
} from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createPersistentQueryClient } from '@/shared/config/queryClient';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainerRef } from '@react-navigation/native';
import { store, persistor } from '@/shared/store';
import RootNavigator from '@/navigation/RootNavigator';
import { initI18n } from '@/shared/config/i18n';
import { initializeFonts } from '@/shared/config/fonts';
import { AlertProvider } from '@/shared/providers';
import { AuthProvider } from '@/shared/components/AuthProvider';
import { initializeColorsFromStorage } from '@/shared/themes/colors';
import SplashScreen from 'react-native-splash-screen';
import { fcmMessagingService } from '@/features/notifications/services/fcmMessagingService';

import type { RootStackParamList } from '@/navigation/types';

// Create a persistent client
const queryClient = createPersistentQueryClient();
// 👇 AppContent component that uses Redux hooks (must be inside Provider)
const AppContent = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [ready, setReady] = useState(false);
  const navigationRef =
    useRef<NavigationContainerRef<RootStackParamList> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await initializeColorsFromStorage();

        await initI18n();
        initializeFonts();

        // await fcmMessagingService.initialize();

        setReady(true);
      } catch (error) {
        console.error('❌ Critical app initialization error:', error);
        // Always set ready to true to prevent app from being stuck
        setReady(true);
      }
    })();
    SplashScreen.hide();
  }, []);

  // useEffect(() => {
  //   return () => {
  //     fcmMessagingService.cleanup();
  //   };
  // }, []);

  // Auth event handler - navigates to login when token refresh fails
  const handleLoginRequired = async () => {
    const currentRoute = navigationRef.current?.getCurrentRoute()?.name;
    const authScreens = ['AuthLoading', 'RememberLogin', 'Login', 'LoginOtp', 'RegisterOtp'];

    if (authScreens.includes(currentRoute || '')) {
      return;
    }

    try {
      const { AutoLoginUtils } = await import('@/features/authentication/utils/autoLoginUtils');
      const cachedPhone = await AutoLoginUtils.getRememberedPhone();
      const cachedUserType = await AutoLoginUtils.getLastUserType();

      if (cachedPhone && cachedUserType && navigationRef.current?.isReady()) {
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: 'RememberLogin' }],
        });
      }
    } catch (error) {
      console.error('❌ Error in handleLoginRequired:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <AlertProvider>
        <AuthProvider onLoginRequired={handleLoginRequired}>
          <View style={styles.container}>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            />
            {ready ? (
              <RootNavigator ref={navigationRef} />
            ) : (
              <View style={styles.loader}>
                <ActivityIndicator size="large" />
              </View>
            )}
          </View>
        </AuthProvider>
      </AlertProvider>
    </SafeAreaProvider>
  );
};

const MainApp = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <PersistGate
            loading={
              <View style={styles.loading}>
                <ActivityIndicator size="large" />
              </View>
            }
            persistor={persistor}
          >
            <AppContent />
          </PersistGate>
        </Provider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
});

export default MainApp;
