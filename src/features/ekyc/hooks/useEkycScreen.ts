import { useState, useCallback, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEkyc, useEkycAvailability } from './useEkyc';
import { useEkycCapture } from './useEkycCapture';
import { ekycService } from '../services/ekycService';
import { ekycDebugLog, logDeviceInfo } from '../utils/ekycUtils';
import { EKYC_CONSTANTS } from '../utils/constants';
import type { EkycType } from '../types/ekyc';

const EKYC_SESSION_KEY = '@ekyc_session_completed';

interface UseEkycScreenProps {
  isRetake?: boolean;
}

/**
 * Hook for EkycScreen business logic
 * Extracts all business logic from EkycScreen component
 */
export const useEkycScreen = (props: UseEkycScreenProps = {}) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<any>>();
  
  // Get isRetake from props or route params
  const isRetake = props.isRetake || route.params?.isRetake || false;
  
  // eKYC hooks
  const {
    isProcessing: ekycIsProcessing,
    summary
  } = useEkyc();

  // Availability check
  const { checkAvailability } = useEkycAvailability();
  
  const { 
    handleCapture,
    isProcessing: captureIsProcessing,
    error: captureError,
    canRetry,
    captureAttempts 
  } = useEkycCapture();

  // Local state
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // Refs for component lifecycle management
  const hasAttemptedEkyc = useRef(false);
  const isMounted = useRef(true);
  const hasCompletedSuccessfully = useRef(false);
  const isNavigating = useRef(false);
  
  // Debug tap handling
  const tapCount = useRef(0);
  const lastTapTime = useRef(0);

  // Combined processing state
  const isProcessing = ekycIsProcessing || captureIsProcessing;

  // Update debug info
  const updateDebugInfo = useCallback((message: string) => {
    setDebugInfo(prev => {
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      const newMessage = `[${timestamp}] ${message}`;
      return prev ? `${newMessage}\n${prev}` : newMessage;
    });
  }, []);

  // Custom logger with UI updates
  const customLogger = useCallback((component: string, message: string, data?: any, isError: boolean = false) => {
    // Call original log function
    ekycDebugLog(component, message, data, isError);

    // Add to UI if error or important info
    if (isError ||
      message.includes('error') ||
      message.includes('Error') ||
      message.includes('failed') ||
      message.includes('Failed') ||
      message.includes('timeout')) {
      updateDebugInfo(message);
    }
  }, [updateDebugInfo]);

  // Handle debug tap (5 taps to toggle debug mode)
  const handleDebugTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapTime.current < 500) {
      tapCount.current += 1;
    } else {
      tapCount.current = 1;
    }
    lastTapTime.current = now;

    if (tapCount.current >= 5) {
      setShowDebugInfo(prev => !prev);
      tapCount.current = 0;
      customLogger('EkycCaptureScreen', `Debug mode ${!showDebugInfo ? 'enabled' : 'disabled'}`);
    }
  }, [showDebugInfo, customLogger]);

  // Check session completion
  const checkSessionCompletion = useCallback(async () => {
    try {
      const completed = await AsyncStorage.getItem(EKYC_SESSION_KEY);
      const isCompleted = completed === 'true';
      setSessionCompleted(isCompleted);
      
      customLogger('EkycCaptureScreen', 'Session completion check', {
        completed: isCompleted,
        isRetake,
      });
      
      return isCompleted;
    } catch (error) {
      customLogger('EkycCaptureScreen', 'Error checking session completion', error, true);
      return false;
    }
  }, [isRetake, customLogger]);

  // Mark session as completed
  const markSessionCompleted = useCallback(async () => {
    try {
      await AsyncStorage.setItem(EKYC_SESSION_KEY, 'true');
      setSessionCompleted(true);
      customLogger('EkycCaptureScreen', 'Session marked as completed');
    } catch (error) {
      customLogger('EkycCaptureScreen', 'Error marking session completion', error, true);
    }
  }, [customLogger]);

  // Clear session completion
  const clearSessionCompletion = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(EKYC_SESSION_KEY);
      setSessionCompleted(false);
      customLogger('EkycCaptureScreen', 'Session completion cleared');
    } catch (error) {
      customLogger('EkycCaptureScreen', 'Error clearing session completion', error, true);
    }
  }, [customLogger]);

  // Handle eKYC start with comprehensive error handling
  const handleStartEkyc = useCallback(async () => {
    if (isProcessing || hasAttemptedEkyc.current) {
      customLogger('EkycCaptureScreen', 'Ignoring handleStartEkyc call - already processing or attempted',
        { isProcessing, hasAttempted: hasAttemptedEkyc.current });
      return;
    }

    if (!isMounted.current) {
      customLogger('EkycCaptureScreen', 'Component not mounted, aborting eKYC start');
      return;
    }

    customLogger('EkycCaptureScreen', 'Starting eKYC process', { isRetake });
    hasAttemptedEkyc.current = true;

    try {
      hasCompletedSuccessfully.current = false;
      isNavigating.current = false;

      if (!isMounted.current) {
        customLogger('EkycCaptureScreen', 'Component unmounted during delay, aborting');
        return;
      }

      customLogger('EkycCaptureScreen', 'Checking eKYC SDK availability');

      if (!checkAvailability()) {
        customLogger('EkycCaptureScreen', 'eKYC SDK not available', null, true);
        Alert.alert(
          'SDK không khả dụng',
          'SDK eKYC không được tìm thấy hoặc không được hỗ trợ trên thiết bị này.',
          [{ text: 'Đóng', onPress: () => navigation.goBack() }]
        );
        return;
      }

      // Use the capture hook to handle the eKYC process
      await handleCapture('full' as EkycType);
      
      customLogger('EkycCaptureScreen', 'eKYC process completed successfully');
      hasCompletedSuccessfully.current = true;
      
      // Mark session as completed
      await markSessionCompleted();

    } catch (error: any) {
      customLogger('EkycCaptureScreen', 'Error in eKYC process', {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack?.substring(0, 200)
      }, true);
      
      // Handle specific error types
      if (error.code === 'USER_CANCELLED') {
        customLogger('EkycCaptureScreen', 'User cancelled eKYC process');
        Alert.alert(
          'Đã hủy',
          'Quá trình xác minh đã bị hủy.',
          [{ text: 'Đóng', onPress: () => navigation.goBack() }]
        );
      } else if (error.code === 'EKYC_TIMEOUT') {
        customLogger('EkycCaptureScreen', 'eKYC timeout occurred', error, true);
        Alert.alert(
          'Quá thời gian',
          'Quá trình xác minh bị quá thời gian. Vui lòng kiểm tra kết nối mạng và thử lại.',
          [
            {
              text: 'Thử lại',
              onPress: () => {
                hasAttemptedEkyc.current = false;
                handleStartEkyc();
              },
            },
            {
              text: 'Hủy',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        // Generic error handling
        Alert.alert(
          'Lỗi',
          error.message || 'Có lỗi xảy ra trong quá trình xác minh. Vui lòng thử lại.',
          [
            {
              text: 'Thử lại',
              onPress: () => {
                hasAttemptedEkyc.current = false;
                handleStartEkyc();
              },
            },
            {
              text: 'Hủy',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } finally {
      hasAttemptedEkyc.current = false;
    }
  }, [
    isProcessing, 
    isRetake, 
    customLogger, 
    checkAvailability, 
    handleCapture, 
    markSessionCompleted, 
    navigation
  ]);

  // Auto-start effect for initial load
  useEffect(() => {
    if (!isRetake &&
      checkAvailability() &&
      !isProcessing &&
      !hasAttemptedEkyc.current &&
      !hasCompletedSuccessfully.current &&
      !isNavigating.current &&
      !sessionCompleted) {
      
      customLogger('EkycCaptureScreen', 'Setting timer for auto-start');
      
      // Start eKYC immediately with minimal delay
      const timer = setTimeout(async () => {
        if (isMounted.current) {
          try {
            await handleStartEkyc();
          } catch (error) {
            // Error should be handled by handleStartEkyc itself
            customLogger('EkycCaptureScreen', 'Auto-start failed', error, true);
          }
        }
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      customLogger('EkycCaptureScreen', 'Auto-start conditions not met', {
        isAvailable: checkAvailability(),
        isProcessing,
        hasAttempted: hasAttemptedEkyc.current,
        hasCompleted: hasCompletedSuccessfully.current,
        isNavigating: isNavigating.current,
        sessionCompleted,
      });
    }
  }, [handleStartEkyc, isProcessing, isRetake, sessionCompleted, customLogger, checkAvailability]);

  // Manual start effect for retakes
  useEffect(() => {
    if (isRetake &&
      checkAvailability() &&
      !isProcessing &&
      !hasAttemptedEkyc.current &&
      !hasCompletedSuccessfully.current &&
      !isNavigating.current) {
      
      customLogger('EkycCaptureScreen', 'Setting timer for retake auto-start');
      const timer = setTimeout(async () => {
        if (isMounted.current) {
          customLogger('EkycCaptureScreen', 'Auto-starting retake eKYC flow after delay');
          try {
            await handleStartEkyc();
          } catch (error) {
            // Error should be handled by handleStartEkyc itself
            customLogger('EkycCaptureScreen', 'Retake auto-start failed', error, true);
          }
        }
      }, 100);

      return () => {
        customLogger('EkycCaptureScreen', 'Clearing retake auto-start timer');
        clearTimeout(timer);
      };
    }
  }, [handleStartEkyc, isProcessing, isRetake, customLogger, checkAvailability]);

  // Log device info on mount
  useEffect(() => {
    logDeviceInfo();
    checkSessionCompletion();
    
    return () => {
      isMounted.current = false;
    };
  }, [checkSessionCompletion]);

  return {
    // State
    isProcessing,
    sessionCompleted,
    debugInfo,
    showDebugInfo,
    isRetake,
    captureAttempts,
    canRetry,
    error: captureError,
    
    // Actions
    handleStartEkyc,
    handleDebugTap,
    clearSessionCompletion,
    markSessionCompleted,
    
    // Utils
    isAvailable: checkAvailability(),
    summary,
    
    // Refs (for component usage)
    hasAttemptedEkyc,
    hasCompletedSuccessfully,
    isNavigating,
    isMounted,
  };
};
