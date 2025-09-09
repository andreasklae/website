import { useLanguage } from '../contexts/LanguageContext'

const LanguageToggle = ({ className = '', isDark = false }) => {
  const { language, toggleLanguage } = useLanguage()

  return (
    <button
      onClick={toggleLanguage}
      className={`
        glass-bubble relative w-20 h-10 rounded-full backdrop-blur-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-105 hover:shadow-xl
        ${isDark 
          ? 'bg-black/20 border-white/20 focus:ring-white/50' 
          : 'bg-white/20 border-white/30 focus:ring-blue-500/50'
        }
        ${className}
      `}
      aria-label={language === 'en' ? 'Switch to Norwegian' : 'Bytt til engelsk'}
    >
      {/* Toggle Circle */}
      <div className={`
        glass-bubble absolute top-0.5 w-9 h-9 rounded-full shadow-lg backdrop-blur-sm border transition-all duration-300 flex items-center justify-center
        ${language === 'en' ? 'left-0.5' : 'right-0.5'}
        ${isDark 
          ? 'bg-white/90 border-white/40' 
          : 'bg-white/90 border-white/60'
        }
      `}>
        <span className="text-sm font-bold text-gray-700">
          {language === 'en' ? 'EN' : 'NO'}
        </span>
      </div>
      
      {/* Background Labels */}
      <div className={`
        absolute inset-0 flex items-center justify-between px-3 text-sm font-medium transition-colors duration-300
        ${isDark ? 'text-white/70' : 'text-gray-700/70'}
      `}>
        <span className={`transition-opacity duration-300 ${language === 'en' ? 'opacity-0' : 'opacity-100'}`}>
          EN
        </span>
        <span className={`transition-opacity duration-300 ${language === 'no' ? 'opacity-0' : 'opacity-100'}`}>
          NO
        </span>
      </div>
    </button>
  )
}

export default LanguageToggle
