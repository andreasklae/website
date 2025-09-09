import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Check localStorage first, then fallback to browser language, then English
    const saved = localStorage.getItem('language');
    if (saved) return saved;
    
    const browserLang = navigator.language.toLowerCase();
    return browserLang.startsWith('no') ? 'no' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'no' : 'en');
  };

  const t = (textObj, fallback = '') => {
    if (typeof textObj === 'string') return textObj;
    if (typeof textObj === 'object' && textObj !== null) {
      return textObj[language] || textObj.en || fallback;
    }
    return fallback;
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
