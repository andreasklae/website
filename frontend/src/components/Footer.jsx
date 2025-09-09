import { useLocation } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

const Footer = () => {
  const { getText } = useLanguage()
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  const content = {
    copyright: {
      en: '© 2025 Andreas Klæboe. All rights reserved.',
      no: '© 2025 Andreas Klæboe. Alle rettigheter reservert.'
    },
    builtBy: {
      en: 'Designed and developed by Andreas Klæboe',
      no: 'Designet og utviklet av Andreas Klæboe'
    }
  }

  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col space-y-8">
          {/* Top row - Contact Info and Social Links (hidden on home page) */}
          {!isHomePage && (
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Contact Info */}
            <div className="text-center md:text-left">
              <div className="space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  andreasklaeboe@gmail.com
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +47 967 98 001
                </div>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/andreasklae"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-bubble inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500/80 to-purple-500/80 text-white rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </a>
              <a
                href="https://github.com/andreasklae"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-bubble inline-flex items-center px-4 py-2 bg-gray-700/80 text-white rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
            </div>
            </div>
          )}
          
          {/* Bottom row - Copyright and Built by */}
          <div className={`flex flex-col md:flex-row justify-between items-center gap-4 ${!isHomePage ? 'pt-8 border-t border-gray-800' : ''}`}>
            <div className="text-sm text-center md:text-left">
              {getText(content.copyright)}
            </div>
            <div className="text-xs opacity-75 text-center md:text-right">
              {getText(content.builtBy)}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
