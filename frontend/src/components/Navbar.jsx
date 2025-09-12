import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageToggle from './LanguageToggle'
import { getAssetPath } from '../utils/paths'
import { Fade as Hamburger } from 'hamburger-react'

const Navbar = () => {
  const { getText } = useLanguage()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)

  const navItems = [
    { path: '/', label: { en: 'Home', no: 'Hjem' } },
    { path: '/software', label: { en: 'Studies + Projects', no: 'Studier + Prosjekter' } },
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

  const handleFabToggle = () => {
    setFabOpen(!fabOpen)
  }

  // Determine if we're on software page for dark theme
  const isDarkMode = location.pathname.startsWith('/software')
  const isPhotographyPage = location.pathname.startsWith('/photography')
  const isSoftwarePage = location.pathname.startsWith('/software')
  const isHomePage = location.pathname === '/'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-6 mt-3">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
              {/* Logo/Name - Hidden on mobile */}
              <div className="hidden md:flex items-center">
                <Link 
                  to="/" 
                  onClick={(e) => handleNavClick('/', e)}
                  className="glass-bubble flex h-16 items-center leading-none space-x-4 group px-4 backdrop-blur-sm border transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '2rem',
                    width: 'fit-content'
                  }}
                >
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 absolute top-1/2 transform -translate-y-1/2 ${
                      isSoftwarePage 
                        ? 'bg-gradient-to-r from-purple-500 to-violet-500'
                        : isPhotographyPage 
                          ? 'bg-gradient-to-r from-black to-gray-700'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    }`}
                    style={{
                      left: '0.75rem'
                    }}
                  >
                    <span className="text-white font-bold text-sm">AK</span>
                  </div>
                  <span 
                    className="font-semibold text-lg transition-colors duration-200"
                    style={{
                      color: isDarkMode ? '#ffffff' : '#000000',
                      textShadow: isDarkMode 
                        ? '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 0 4px #000'
                        : 'none',
                      marginLeft: '3rem'
                    }}
                  >
                    Andreas Klæboe
                  </span>
                </Link>
              </div>

              {/* Navigation Items */}
              <div className="hidden md:flex items-center space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={(e) => handleNavClick(item.path, e)}
                    className={`
                      glass-bubble px-6 h-16 flex items-center leading-none text-base font-medium transition-all duration-300 backdrop-blur-sm border hover:scale-105 hover:shadow-xl
                      ${isActive(item.path)
                        ? item.path === '/photography'
                          ? 'bg-gradient-to-r from-black to-gray-800 border-gray-600/60 text-white shadow-xl scale-105'
                          : item.path === '/software'
                            ? 'bg-gradient-to-r from-purple-600 to-violet-500 border-purple-400/60 text-white shadow-xl scale-105'
                            : isDarkMode
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 border-blue-400/60 text-white shadow-xl scale-105'
                              : 'bg-gradient-to-r from-blue-500 to-sky-400 border-blue-400/60 text-white shadow-xl scale-105'
                        : isDarkMode
                          ? 'bg-black/50 border-white/20 hover:bg-white/10'
                          : 'bg-white/50 border-white/30 hover:bg-white/60'
                      }
                    `}
                    style={{
                      borderRadius: '2rem',
                      color: isActive(item.path) 
                        ? '#ffffff' 
                        : isDarkMode 
                          ? '#ffffff' 
                          : '#000000',
                      textShadow: isActive(item.path) 
                        ? 'none'
                        : isDarkMode 
                          ? '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 0 4px #000'
                          : 'none'
                    }}
                  >
                    {getText(item.label)}
                  </Link>
                ))}
              </div>

              {/* Language Toggle - Desktop Only */}
              <div className="hidden md:flex items-center">
                <LanguageToggle isDark={isDarkMode} />
              </div>
            </div>

            {/* Mobile Language Toggle - Top Right */}
            <div className="md:hidden fixed top-3 right-6 z-[60] px-6 py-3">
              <LanguageToggle isDark={isDarkMode} />
            </div>

            {/* Floating Action Button - Mobile Only */}
            <div className="md:hidden fixed bottom-6 right-6 z-[60]">
              {/* FAB Navigation Options - Always rendered for glassmorphism */}
              <div className="absolute bottom-16 right-0 flex flex-col-reverse space-y-reverse space-y-4">
                {navItems.map((item, index) => (
                  <div
                    key={item.path}
                    className={`
                      glass-bubble px-6 py-4 backdrop-blur-sm border transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl
                      ${isActive(item.path)
                        ? item.path === '/photography'
                          ? 'bg-gradient-to-r from-black to-gray-800 border-gray-600/60 text-white shadow-xl scale-105'
                          : item.path === '/software'
                            ? 'bg-gradient-to-r from-purple-600 to-violet-500 border-purple-400/60 text-white shadow-xl scale-105'
                            : isDarkMode
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 border-blue-400/60 text-white shadow-xl scale-105'
                              : 'bg-gradient-to-r from-blue-500 to-sky-400 border-blue-400/60 text-white shadow-xl scale-105'
                        : isDarkMode
                          ? 'bg-black/50 border-white/20 text-gray-300 hover:text-white hover:bg-white/10'
                          : 'bg-white/50 border-white/30 text-gray-700 hover:text-gray-900 hover:bg-white/60'
                      }
                    `}
                    style={{
                      borderRadius: '2rem',
                      backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)',
                      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.3)',
                      transitionDelay: `${index * 50}ms`,
                      opacity: fabOpen ? 1 : 0,
                      transform: fabOpen ? 'translateY(0)' : 'translateY(16px)',
                      visibility: fabOpen ? 'visible' : 'hidden',
                      pointerEvents: fabOpen ? 'auto' : 'none'
                    }}
                  >
                    <Link
                      to={item.path}
                      onClick={(e) => {
                        handleNavClick(item.path, e)
                        setFabOpen(false)
                      }}
                      className="block w-full h-full"
                    >
                      <span 
                        className="text-base font-medium whitespace-nowrap"
                        style={{
                          color: isActive(item.path) 
                            ? '#ffffff' 
                            : isDarkMode 
                              ? '#ffffff' 
                              : '#000000',
                          textShadow: isActive(item.path) 
                            ? 'none'
                            : isDarkMode 
                              ? '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 0 4px #000'
                              : 'none'
                        }}
                      >
                        {getText(item.label)}
                      </span>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Main FAB Button */}
              <button
                type="button"
                onClick={handleFabToggle}
                className={`
                  glass-bubble w-16 h-16 backdrop-blur-sm border transition-all duration-300 hover:scale-105 hover:shadow-xl
                  ${isDarkMode 
                    ? 'text-white hover:bg-white/10' 
                    : 'text-gray-900 hover:bg-white/30'
                  }
                `}
                style={{
                  backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '2rem'
                }}
                aria-label="Navigation menu"
              >
                <div className="flex items-center justify-center w-full h-full">
                  <Hamburger
                    toggled={fabOpen}
                    toggle={setFabOpen}
                    size={24}
                    color={isDarkMode ? '#ffffff' : '#1f2937'}
                    lineWidth={2.5}
                  />
                </div>
              </button>
            </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
