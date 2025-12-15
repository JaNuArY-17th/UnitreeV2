import React, { forwardRef, useEffect, useState } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import LoginScreen from '@/features/authentication/screens/LoginScreen';
import RememberLoginScreen from '@/features/authentication/screens/RememberLoginScreen';
import RegisterScreen from '@/features/authentication/screens/RegisterScreen';
import LoginOtpScreen from '@/features/authentication/screens/LoginOtpScreen';
import RegisterOtpScreen from '@/features/authentication/screens/RegisterOtpScreen';
import ForgotPasswordScreen from '@/features/authentication/screens/ForgotPasswordScreen';
import ForgotPasswordOtpScreen from '@/features/authentication/screens/ForgotPasswordOtpScreen';
import ResetPasswordScreen from '@/features/authentication/screens/ResetPasswordScreen';
import {
  UserDetailScreen,
  ProfileResetPasswordScreen,
  ProfileResetPasswordOtpScreen,
  ProfileResetPasswordNewPasswordScreen,
  ChangePasswordScreen,
  AppInformationScreen,
  SupportCenterScreen
} from '@/features/profile/screens';
import { NotificationScreen, SpeakerServiceScreen, LinkSpeakerScreen } from '@/features/notifications/screens';
import NotificationSettingsScreen from '@/features/profile/screens/NotificationSettingsScreen';
import SecuritySettingsScreen from '@/features/profile/screens/SecuritySettingsScreen';
import { EditContactScreen, EditContactOtpScreen } from '@/features/profile/screens';
import { PolicySecurityRiskScreen as PolicyScreen } from '@/features/profile/screens/PolicyScreen';
import BottomTabNavigator from './BottomTabNavigator';
import { useAuth } from '@/shared/components/AuthProvider';
import type { RootStackParamList } from './types';
import { useNotificationNavigation } from '@/features/notifications/hooks/useNotificationNavigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Component that renders inside NavigationContainer to handle notifications
const NavigationContent = () => {
  const { isAuthenticated } = useAuth();
  const [initialAuthRoute, setInitialAuthRoute] = useState<'Login' | 'RememberLogin'>('Login');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check for cached credentials on mount to determine initial route
  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        const { AutoLoginUtils } = await import('@/features/authentication/utils/autoLoginUtils');
        const cachedPhone = await AutoLoginUtils.getRememberedPhone();
        const cachedUserType = await AutoLoginUtils.getLastUserType();

        if (cachedPhone && cachedUserType) {
          console.log('✅ [RootNavigator] Found cached credentials, setting initial route to RememberLogin');
          setInitialAuthRoute('RememberLogin');
        } else {
          console.log('⚠️ [RootNavigator] No cached credentials, setting initial route to Login');
          setInitialAuthRoute('Login');
        }
      } catch (error) {
        console.error('❌ [RootNavigator] Error checking cached credentials:', error);
        setInitialAuthRoute('Login');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    if (!isAuthenticated) {
      checkInitialRoute();
    } else {
      setIsCheckingAuth(false);
    }
  }, [isAuthenticated]);

  // Use notification navigation hook - this must be inside NavigationContainer
  const notificationToast = useNotificationNavigation('top');

  // Show loading while checking auth route
  if (!isAuthenticated && isCheckingAuth) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack - order matters! First screen is the initial route
          <Stack.Group key="auth">
            {initialAuthRoute === 'RememberLogin' ? (
              <>
                <Stack.Screen
                  name="RememberLogin"
                  component={RememberLoginScreen}
                  options={{
                    animation: 'fade',
                  }}
                />
                <Stack.Screen
                  name="Login"
                  component={LoginScreen}
                  options={{
                    animation: 'fade',
                  }}
                />
              </>
            ) : (
              <>
                <Stack.Screen
                  name="Login"
                  component={LoginScreen}
                  options={{
                    animation: 'fade',
                  }}
                />
                <Stack.Screen
                  name="RememberLogin"
                  component={RememberLoginScreen}
                  options={{
                    animation: 'fade',
                  }}
                />
              </>
            )}
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="RegisterOtp" component={RegisterOtpScreen} />
            <Stack.Screen name="LoginOtp" component={LoginOtpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen
              name="ForgotPasswordOtp"
              component={ForgotPasswordOtpScreen}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
            />
            <Stack.Screen name="Policy" component={PolicyScreen} />
          </Stack.Group>
        ) : (
          // Main App Stack
          <Stack.Group key="main">
            <Stack.Screen
              name="MainTabs"
              component={BottomTabNavigator}
              options={{
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="Main"
              component={BottomTabNavigator}
              options={{
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="UserDetail"
              component={UserDetailScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="Notification"
              component={NotificationScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="NotificationSettings"
              component={NotificationSettingsScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="SpeakerNotificationSettings"
              component={SpeakerServiceScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="LinkSpeaker"
              component={LinkSpeakerScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="SecuritySettings"
              component={SecuritySettingsScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="ProfileResetPassword"
              component={ProfileResetPasswordScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="ProfileResetPasswordOtp"
              component={ProfileResetPasswordOtpScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="ProfileResetPasswordNewPassword"
              component={ProfileResetPasswordNewPasswordScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="EditContact"
              component={EditContactScreen}
            />
            <Stack.Screen
              name="EditContactOtp"
              component={EditContactOtpScreen}
            />
            <Stack.Screen name="AppInformation" component={AppInformationScreen} />
            <Stack.Screen name="SupportCenter" component={SupportCenterScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
      {notificationToast}
    </>
  );
};

const RootNavigator = forwardRef<NavigationContainerRef<RootStackParamList>>((props, ref) => {
  const { isLoading } = useAuth();

  // Log authentication state changes for debugging
  useEffect(() => {
    console.log('🔐 RootNavigator: Auth state changed', {
      isLoading,
      timestamp: new Date().toISOString(),
    });
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00492B" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={ref}>
      <NavigationContent />
    </NavigationContainer>
  );
});

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default RootNavigator;
