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
        console.log('[LanguageProvider] Initializing language');
        // Get language from AsyncStorage first
        const stored = await AsyncStorage.getItem('app_language');
        console.log('[LanguageProvider] Stored language from AsyncStorage:', stored);
        const lng = (stored || i18n.language || 'vi').split('-')[0] as 'en' | 'vi';
        console.log('[LanguageProvider] Setting currentLanguage to:', lng);
        setCurrentLanguage(lng);
      } catch (error) {
        console.warn('[LanguageProvider] Failed to load language preference:', error);
        const fallback = (i18n.language || 'vi').split('-')[0] as 'en' | 'vi';
        console.log('[LanguageProvider] Using fallback language:', fallback);
        setCurrentLanguage(fallback);
      }
      setInitialized(true);
    };

    initLanguage();
  }, []);

  // Listen to i18n language changes
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      console.log('[LanguageProvider] languageChanged event received with language:', lng);
      const newLng = lng.split('-')[0] as 'en' | 'vi';
      console.log('[LanguageProvider] Updating currentLanguage to:', newLng);
      setCurrentLanguage(newLng);
    };

    console.log('[LanguageProvider] Setting up languageChanged listener');
    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      console.log('[LanguageProvider] Removing languageChanged listener');
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  const changeLanguage = useCallback(async (language: 'en' | 'vi') => {
    console.log('[LanguageProvider] changeLanguage called with:', language);
    console.log('[LanguageProvider] currentLanguage:', currentLanguage, 'isLoading:', isLoading);
    
    if (currentLanguage === language || isLoading) {
      console.log('[LanguageProvider] Skipping change - same language or already loading');
      return;
    }

    setIsLoading(true);
    try {
      console.log('[LanguageProvider] Calling setLanguageInI18n with:', language);
      await setLanguageInI18n(language);
      console.log('[LanguageProvider] setLanguageInI18n completed');
      setCurrentLanguage(language);
    } catch (error) {
      console.error('[LanguageProvider] Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage, isLoading]);

  if (!initialized) {
    console.log('[LanguageProvider] Not initialized yet, rendering children without provider');
    return <>{children}</>;
  }

  console.log('[LanguageProvider] Rendering with language:', currentLanguage, 'isLoading:', isLoading);
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
