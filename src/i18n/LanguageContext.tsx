import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { locales, languages, getLanguageByCode, LocaleKey, Language } from './index';

interface LanguageContextType {
  language: LocaleKey;
  setLanguage: (lang: LocaleKey) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
  currentLanguage: Language;
  languages: Language[];
}

// Create context with undefined as default
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'preferred-language';

// Helper function to get nested translation value
const getNestedValue = (obj: Record<string, unknown>, path: string): string => {
  const keys = path.split('.');
  let value: unknown = obj;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in (value as Record<string, unknown>)) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return path; // Return the key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : path;
};

// Language Provider component that wraps the app
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LocaleKey>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored in locales) {
        return stored as LocaleKey;
      }
    }
    return 'ar'; // Default to Arabic
  });

  const currentLanguage = getLanguageByCode(language);
  const dir = currentLanguage.dir;

  const setLanguage = (lang: LocaleKey) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  const t = (key: string): string => {
    const translations = locales[language];
    return getNestedValue(translations as Record<string, unknown>, key);
  };

  // Update document direction and lang attribute
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    
    // Update body class for RTL/LTR specific styling
    document.body.classList.remove('ltr', 'rtl');
    document.body.classList.add(dir);
  }, [language, dir]);

  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t,
    dir,
    currentLanguage,
    languages,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use language context
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
}

// Re-export for backwards compatibility
export { LanguageContext };
