import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { setLanguage as setLanguageInI18n } from '@/shared/config/i18n';

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
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'vi'>('vi');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with current i18n language
  useEffect(() => {
    const lng = (i18n.language || 'vi').split('-')[0] as 'en' | 'vi';
    setCurrentLanguage(lng);
  }, [i18n.language]);

  const changeLanguage = async (language: 'en' | 'vi') => {
    setIsLoading(true);
    try {
      await setLanguageInI18n(language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
