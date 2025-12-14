import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { speakerNotificationService } from '../services/speakerNotificationService';
import type { TransactionNotificationData } from '../types';

/**
 * Hook to handle speaker notifications for transactions
 * Listens for transaction events and speaks them using TTS
 */
export const useSpeakerNotification = () => {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Initialize TTS when hook mounts
    speakerNotificationService.initializeTts().catch(error => {
      console.error('Failed to initialize TTS in hook:', error);
    });

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      speakerNotificationService.stopSpeaking();
    };
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    const settings = await speakerNotificationService.getSettings();
    
    // If background notifications are disabled, stop speaking when app goes to background
    if (
      settings &&
      !settings.backgroundEnabled &&
      appState.current.match(/active/) &&
      nextAppState.match(/inactive|background/)
    ) {
      speakerNotificationService.stopSpeaking();
    }

    appState.current = nextAppState;
  };

  /**
   * Trigger speaker notification for a transaction
   * @param data Transaction notification data
   */
  const speakTransaction = async (data: TransactionNotificationData) => {
    try {
      await speakerNotificationService.handleTransactionNotification(data);
    } catch (error) {
      console.error('Failed to speak transaction:', error);
    }
  };

  /**
   * Stop current speech
   */
  const stopSpeaking = async () => {
    try {
      await speakerNotificationService.stopSpeaking();
    } catch (error) {
      console.error('Failed to stop speaking:', error);
    }
  };

  return {
    speakTransaction,
    stopSpeaking,
  };
};
