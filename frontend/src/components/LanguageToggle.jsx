import { useLanguage } from '../contexts/LanguageContext';

const LanguageToggle = ({ className = '' }) => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className={`btn-glass-light text-sm font-medium ${className}`}
      aria-label={language === 'en' ? 'Switch to Norwegian' : 'Bytt til engelsk'}
    >
      <span className="flex items-center gap-2">
        <span className="text-lg">
          {language === 'en' ? '🇳🇴' : '🇬🇧'}
        </span>
        <span>
          {language === 'en' ? 'NO' : 'EN'}
        </span>
      </span>
    </button>
  );
};

export default LanguageToggle;
