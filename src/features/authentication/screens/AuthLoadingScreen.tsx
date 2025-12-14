import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, StatusBar, Text, Animated, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { colors } from '@/shared/themes';
import { AutoLoginUtils } from '../utils/autoLoginUtils';
import { authGuard } from '@/shared/services/authGuard';

/**
 * AuthLoadingScreen
 * Displays a full-screen loading overlay while checking authentication state
 * and determining the correct navigation route.
 *
 * This screen is shown when:
 * - App is reopened
 * - Token expires and needs re-authentication
 * - Any auth state change requiring navigation decision
 */
const AuthLoadingScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const fade = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      try {
        console.log('🔍 [AuthLoadingScreen] Checking authentication state...');

        // First, check if user has valid token
        const hasValidToken = await authGuard.hasValidToken();
        console.log('🔐 [AuthLoadingScreen] Has valid token:', hasValidToken);

        if (hasValidToken) {
          // User is authenticated, no need to show login screens
          console.log('✅ [AuthLoadingScreen] User authenticated, staying in app');
          // The AuthProvider will handle navigation to main app
          return;
        }

        // No valid token - check for cached login data
        const cachedPhone = await AutoLoginUtils.getRememberedPhone();
        const cachedUserType = await AutoLoginUtils.getLastUserType();

        console.log('📊 [AuthLoadingScreen] Cached data:', {
          hasPhone: !!cachedPhone,
          userType: cachedUserType,
        });

        if (cachedPhone && cachedUserType) {
          // Has cached data - navigate to RememberLogin screen
          console.log('✅ [AuthLoadingScreen] Found cached login data, navigating to RememberLogin');
          // Check if we can navigate (not in a navigation transaction)
          if (navigation.getState().routes.length > 0) {
            navigation.replace('RememberLogin');
          }
        } else {
          // No cached data - navigate to regular Login screen
          console.log('⚠️ [AuthLoadingScreen] No cached login data, navigating to Login');
          // Check if we can navigate (not in a navigation transaction)
          if (navigation.getState().routes.length > 0) {
            navigation.replace('Login');
          }
        }
      } catch (error) {
        console.error('❌ [AuthLoadingScreen] Error during auth check:', error);
        // On error, fallback to regular login
        navigation.replace('Login');
      }
    };

    // Small delay to ensure smooth transition and prevent flashing
    const timer = setTimeout(() => {
      checkAuthAndNavigate();
    }, 300);

    // Fade-in animation
    Animated.timing(fade, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();

    return () => {
      clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.content} accessibilityRole="summary" accessibilityLabel="Loading authentication state">
        <Text style={styles.appTitle} accessibilityRole="header">ESPay</Text>
        <ActivityIndicator size="large" color="#FFFFFF" style={styles.spinner} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  appTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 24,
  },
  spinner: {
    transform: [{ scale: 1.2 }],
  },
});

export default AuthLoadingScreen;
