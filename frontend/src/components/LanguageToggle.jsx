import { useLanguage } from '../contexts/LanguageContext'

const LanguageToggle = ({ className = '', isDark = false }) => {
  const { language, toggleLanguage } = useLanguage()

  return (
    <button
      onClick={toggleLanguage}
      className={`
        glass-bubble relative w-28 h-16 backdrop-blur-xl border transition-all duration-300 focus:outline-none hover:scale-105 hover:shadow-xl
        ${isDark 
          ? 'bg-black/20 border-white/20' 
          : 'bg-white/20 border-white/30'
        }
        ${className}
      `}
      style={{
        borderRadius: '2rem'
      }}
      aria-label={language === 'en' ? 'Switch to Norwegian' : 'Bytt til engelsk'}
    >
      {/* Toggle Circle - Slides behind text */}
      <div 
        className={`
          glass-bubble absolute top-1/2 left-1/2 w-12 h-12 rounded-full shadow-lg backdrop-blur-sm border transition-transform duration-500 ease-in-out transform -translate-y-1/2 z-10
          ${isDark 
            ? 'bg-white/90 border-white/40' 
            : 'bg-white/90 border-white/60'
          }
        `}
        style={{
          transform: `translate(-50%, -50%) ${language === 'en' ? 'translateX(-1.25rem)' : 'translateX(1.25rem)'}`
        }}
      >
      </div>

      {/* Background Labels - Fixed positions */}
      <div className={`
        absolute inset-0 flex items-center justify-center text-base font-medium z-20
        ${isDark ? 'text-white/70' : 'text-gray-700/70'}
      `}>
        <span 
          className={`absolute transition-colors duration-300 ${language === 'en' ? 'text-gray-700 font-bold' : ''}`}
          style={{ 
            left: '2.25rem',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          EN
        </span>
        <span 
          className={`absolute transition-colors duration-300 ${language === 'no' ? 'text-gray-700 font-bold' : ''}`}
          style={{ 
            left: '4.75rem',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          NO
        </span>
      </div>
    </button>
  )
}

export default LanguageToggle
