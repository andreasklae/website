import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageToggle from './LanguageToggle'

const Navbar = () => {
  const { getText } = useLanguage()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { path: '/', label: { en: 'Home', no: 'Hjem' } },
    { path: '/software', label: { en: 'Software', no: 'Programvare' } },
    { path: '/photography', label: { en: 'Photography', no: 'Foto' } }
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const handleNavClick = (path, e) => {
    if (isActive(path)) {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Determine if we're on software page for dark theme
  const isDarkMode = location.pathname.startsWith('/software')
  const isPhotographyPage = location.pathname.startsWith('/photography')

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-6 mt-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
              {/* Logo/Name */}
              <Link 
                to="/" 
                className="glass-bubble flex items-center space-x-3 group px-4 py-2 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.3)'
                }}
              >
                <div className="w-8 h-8 transition-all duration-300 group-hover:scale-110">
                  {isPhotographyPage ? (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300">
                      <span className="text-white font-bold text-xs">AK</span>
                    </div>
                  ) : (
                    <img
                      src="ak-logo.svg"
                      alt="AK Logo"
                      className="w-full h-full"
                    />
                  )}
                </div>
                <span className={`font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Andreas Klæboe
                </span>
              </Link>

              {/* Navigation Items */}
              <div className="hidden md:flex items-center space-x-3">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={(e) => handleNavClick(item.path, e)}
                    className={`
                      glass-bubble px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300 backdrop-blur-xl border hover:scale-105 hover:shadow-xl
                      ${isActive(item.path)
                        ? item.path === '/photography'
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 border-orange-400/60 text-white shadow-xl scale-105'
                          : isDarkMode
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 border-blue-400/60 text-white shadow-xl scale-105'
                            : 'bg-gradient-to-r from-blue-500 to-sky-400 border-blue-400/60 text-white shadow-xl scale-105'
                        : isDarkMode
                          ? 'bg-black/20 border-white/20 text-gray-300 hover:text-white hover:bg-white/10'
                          : 'bg-white/20 border-white/30 text-gray-700 hover:text-gray-900 hover:bg-white/30'
                      }
                    `}
                  >
                    {getText(item.label)}
                  </Link>
                ))}
              </div>

              {/* Language Toggle & Mobile Menu */}
              <div className="flex items-center space-x-3">
                <LanguageToggle isDark={isDarkMode} />
                
                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className={`
                      glass-bubble p-3 rounded-xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 hover:shadow-xl
                      ${isDarkMode 
                        ? 'bg-black/20 border-white/20 text-white hover:bg-white/10' 
                        : 'bg-white/20 border-white/30 text-gray-900 hover:bg-white/30'
                      }
                    `}
                    aria-label="Toggle menu"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden pt-4 animate-slide-down">
                <div className="flex flex-col space-y-3">
                  {navItems.map((item, index) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={(e) => {
                        handleNavClick(item.path, e)
                        setMobileMenuOpen(false)
                      }}
                      className={`
                        glass-bubble px-6 py-4 rounded-2xl text-sm font-medium transition-all duration-200 backdrop-blur-xl border hover:scale-105 hover:shadow-xl animate-slide-up
                        ${isActive(item.path)
                          ? item.path === '/photography'
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 border-orange-400/60 text-white shadow-xl scale-105'
                            : isDarkMode
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 border-blue-400/60 text-white shadow-xl scale-105'
                              : 'bg-gradient-to-r from-blue-500 to-sky-400 border-blue-400/60 text-white shadow-xl scale-105'
                          : isDarkMode
                            ? 'bg-black/20 border-white/20 text-gray-300 hover:text-white hover:bg-white/10'
                            : 'bg-white/20 border-white/30 text-gray-700 hover:text-gray-900 hover:bg-white/30'
                        }
                      `}
                      style={{
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      {getText(item.label)}
                    </Link>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
