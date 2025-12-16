import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import i18n from '@/shared/config/i18n';
import { setLanguage as setLanguageInI18n } from '@/shared/config/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LanguageContextType {
  currentLanguage: 'en' | 'vi';
  changeLanguage: (language: 'en' | 'vi') => Promise<void>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'vi'>('vi');
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize language from i18n on mount
  useEffect(() => {
    const initLanguage = async () => {
      try {
        // Get language from AsyncStorage first
        const stored = await AsyncStorage.getItem('app_language');
        const lng = (stored || i18n.language || 'vi').split('-')[0] as 'en' | 'vi';
        setCurrentLanguage(lng);
      } catch (error) {
        console.warn('Failed to load language preference:', error);
        setCurrentLanguage((i18n.language || 'vi').split('-')[0] as 'en' | 'vi');
      }
      setInitialized(true);
    };

    initLanguage();
  }, []);

  // Listen to i18n language changes
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      const newLng = lng.split('-')[0] as 'en' | 'vi';
      setCurrentLanguage(newLng);
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  const changeLanguage = useCallback(async (language: 'en' | 'vi') => {
    if (currentLanguage === language || isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      await setLanguageInI18n(language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage, isLoading]);

  if (!initialized) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
