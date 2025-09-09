import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Check localStorage first, then browser language, fallback to English
    const saved = localStorage.getItem('language')
    if (saved && (saved === 'en' || saved === 'no')) {
      return saved
    }
    
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.startsWith('no') || browserLang.startsWith('nb') || browserLang.startsWith('nn')) {
      return 'no'
    }
    
    return 'en'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
    document.documentElement.lang = language === 'no' ? 'no' : 'en'
  }, [language])

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'no' : 'en')
  }

  // Helper function to get text in current language
  const getText = (textObj, fallback = '') => {
    if (!textObj) return fallback
    if (typeof textObj === 'string') return textObj
    return textObj[language] || textObj['en'] || fallback
  }

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    getText,
    isNorwegian: language === 'no',
    isEnglish: language === 'en'
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
