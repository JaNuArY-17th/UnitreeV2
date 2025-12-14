import React, { createContext, useContext, ReactNode } from 'react';
import CustomAlert from '@/shared/components/CustomAlert';
import { useCustomAlert } from '@/shared/hooks/useCustomAlert';
import type { AlertOptions } from '@/shared/hooks/useCustomAlert';

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  alert: (title: string, message?: string, buttons?: any[]) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const { alertState, showAlert, hideAlert, alert } = useCustomAlert();

  const contextValue: AlertContextType = {
    showAlert,
    alert,
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onDismiss={hideAlert}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export default AlertProvider;
