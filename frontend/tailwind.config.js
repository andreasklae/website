/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design tokens for easy theming
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // IDE theme colors for software page
        ide: {
          bg: '#0d1117',
          surface: '#161b22',
          border: '#30363d',
          text: '#c9d1d9',
          accent: {
            purple: '#a855f7',
            blue: '#3b82f6',
            orange: '#f97316',
            green: '#22c55e'
          }
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'monospace'],
      },
      backdropBlur: {
        'xs': '2px',
        '2xl': '40px',
        '3xl': '64px',
      },
      transitionDuration: {
        '800': '800ms',
        '1200': '1200ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-in-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'slide-down': 'slideDown 0.15s ease-out',
        'page-enter': 'pageEnter 0.8s ease-out',
        'glass-float': 'glassFloat 3s ease-in-out infinite',
        'glass-pulse': 'glassPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pageEnter: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        glassFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glassPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(255, 255, 255, 0)' },
        }
      }
    },
  },
  plugins: [],
}
