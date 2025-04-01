
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from '@/services/types';

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  languages: Language[];
};

const availableLanguages: Language[] = ['en', 'de', 'fr', 'es'];

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(
    (localStorage.getItem('language') as Language) || 'en'
  );

  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        language,
        setLanguage: handleSetLanguage,
        languages: availableLanguages
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
