import React, { forwardRef, useEffect, useState } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import LoginScreen from '@/features/authentication/screens/LoginScreen';
import RegisterEmailScreen from '@/features/authentication/screens/RegisterEmailScreen';
import RegisterCodeScreen from '@/features/authentication/screens/RegisterCodeScreen';
import RegisterCompleteScreen from '@/features/authentication/screens/RegisterCompleteScreen';
import ForgotPasswordEmailScreen from '@/features/authentication/screens/ForgotPasswordEmailScreen';
import ForgotPasswordCodeScreen from '@/features/authentication/screens/ForgotPasswordCodeScreen';
import ForgotPasswordResetScreen from '@/features/authentication/screens/ForgotPasswordResetScreen';
import HomeScreen from '@/features/home/screens/HomeScreen';
import {BottomTabNavigator} from './BottomTabNavigator';
import { useAuth } from '@/shared/components/AuthProvider';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Component that renders inside NavigationContainer to handle notifications
const NavigationContent = () => {
  const { isAuthenticated } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check for cached credentials on mount to determine initial route
  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        setIsCheckingAuth(false);
      } catch (error) {
        console.error('❌ [RootNavigator] Error checking cached credentials:', error);
        setIsCheckingAuth(false);
      }
    };

    if (!isAuthenticated) {
      checkInitialRoute();
    } else {
      setIsCheckingAuth(false);
    }
  }, [isAuthenticated]);

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
          // Auth Stack
          <Stack.Group key="auth">
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                animation: 'fade',
              }}
            />
            {/* Register flow */}
            <Stack.Screen name="Register" component={RegisterEmailScreen} />
            <Stack.Screen name="RegisterEmail" component={RegisterEmailScreen} />
            <Stack.Screen name="RegisterCode" component={RegisterCodeScreen} />
            <Stack.Screen name="RegisterComplete" component={RegisterCompleteScreen} />
            
            {/* Forgot Password flow */}
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordEmailScreen} />
            <Stack.Screen name="ForgotPasswordEmail" component={ForgotPasswordEmailScreen} />
            <Stack.Screen name="ForgotPasswordCode" component={ForgotPasswordCodeScreen} />
            <Stack.Screen name="ForgotPasswordReset" component={ForgotPasswordResetScreen} />
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
          </Stack.Group>
        )}
      </Stack.Navigator>
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
