import { useState, useCallback } from 'react';
import type { AlertButton } from '@/shared/components/CustomAlert';

export interface AlertOptions {
  title?: string;
  message?: string;
  buttons?: AlertButton[];
  buttonColor?: string;
}

export interface AlertState {
  visible: boolean;
  title?: string;
  message?: string;
  buttons?: AlertButton[];
  buttonColor?: string;
}

export const useCustomAlert = () => {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
  });

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertState({
      visible: true,
      title: options.title,
      message: options.message,
      buttons: options.buttons || [{ text: 'OK' }],
      buttonColor: options.buttonColor,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  // Convenience method that mimics React Native's Alert.alert API
  const alert = useCallback((
    title: string,
    message?: string,
    buttons?: AlertButton[]
  ) => {
    showAlert({ title, message, buttons, buttonColor: undefined });
  }, [showAlert]);

  return {
    alertState,
    showAlert,
    hideAlert,
    alert,
  };
};

export default useCustomAlert;
