/**
 * Firebase debugging utilities to help diagnose initialization issues
 */
import { getApps, getApp } from '@react-native-firebase/app';
import { Platform } from 'react-native';

/**
 * Comprehensive Firebase debug information
 */
export const logFirebaseDebugInfo = () => {
  console.log('🔍 === Firebase Debug Information ===');
  console.log('📱 Platform:', Platform.OS);
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  try {
    // Check available apps
    const apps = getApps();
    console.log('📱 Available Firebase apps:', {
      count: apps.length,
      apps: apps.map(app => ({
        name: app.name,
        hasOptions: !!app.options,
        projectId: app.options?.projectId || 'unknown',
      })),
    });
    
    if (apps.length === 0) {
      console.error('❌ No Firebase apps found!');
      console.log('💡 This usually means:');
      console.log('   - Firebase is not initialized in native code');
      console.log('   - google-services.json/GoogleService-Info.plist is missing or invalid');
      console.log('   - React Native Firebase is not properly linked');
      return;
    }
    
    // Try to get default app
    try {
      const defaultApp = getApp();
      console.log('✅ Default Firebase app:', {
        name: defaultApp.name,
        projectId: defaultApp.options?.projectId,
        hasOptions: !!defaultApp.options,
      });
      
      // Log specific options (safely)
      if (defaultApp.options) {
        console.log('🔧 Firebase options:', {
          projectId: defaultApp.options.projectId,
          appId: defaultApp.options.appId,
          messagingSenderId: defaultApp.options.messagingSenderId,
        });
      }
      
    } catch (appError) {
      console.error('❌ Cannot get default Firebase app:', appError);
    }
    
  } catch (error) {
    console.error('❌ Error during Firebase debug:', error);
  }
  
  console.log('🔍 === End Firebase Debug Information ===');
};

/**
 * Test Firebase functionality step by step
 */
export const testFirebaseStepByStep = async () => {
  console.log('🧪 === Firebase Step-by-Step Test ===');
  
  try {
    // Step 1: Check if React Native Firebase module is available
    console.log('🔍 Step 1: Checking React Native Firebase availability...');
    const { getApps: testGetApps } = await import('@react-native-firebase/app');
    console.log('✅ React Native Firebase module loaded successfully');
    
    // Step 2: Check apps
    console.log('🔍 Step 2: Checking Firebase apps...');
    const apps = testGetApps();
    console.log(`📱 Found ${apps.length} Firebase app(s)`);
    
    if (apps.length === 0) {
      console.error('❌ No Firebase apps initialized');
      return false;
    }
    
    // Step 3: Test default app
    console.log('🔍 Step 3: Testing default app access...');
    const { getApp: testGetApp } = await import('@react-native-firebase/app');
    const app = testGetApp();
    console.log('✅ Default app accessible:', app.name);
    
    // Step 4: Test messaging module
    console.log('🔍 Step 4: Testing Firebase messaging module...');
    const { getMessaging } = await import('@react-native-firebase/messaging');
    const messaging = getMessaging(app);
    console.log('✅ Firebase messaging module loaded successfully');
    
    console.log('🎉 All Firebase tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return false;
  }
};

/**
 * Simple Firebase health check
 */
export const isFirebaseHealthy = (): boolean => {
  try {
    const apps = getApps();
    if (apps.length === 0) return false;
    
    const app = getApp();
    return !!app && !!app.options;
  } catch {
    return false;
  }
};

