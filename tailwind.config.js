/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Primary Teal
          600: '#0d9488', // Button Teal
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        dark: {
          bg: '#070c14',
          surface: '#0d1524',
          card: '#121d30',
          cardHover: '#18273f',
          border: 'rgba(255, 255, 255, 0.08)',
          borderGlow: 'rgba(20, 184, 166, 0.3)',
          subtle: '#64748b',
          muted: '#94a3b8',
        },
        gold: {
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        }
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(0,0,0,0.04)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.35), 0 2px 6px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 12px 32px -4px rgba(20, 184, 166, 0.15), 0 4px 12px -2px rgba(0, 0, 0, 0.3)',
        'glow-teal': '0 0 24px -2px rgba(20, 184, 166, 0.45)',
        'glow-indigo': '0 0 24px -2px rgba(99, 102, 241, 0.45)',
        'glow-gold': '0 0 24px -2px rgba(234, 179, 8, 0.45)',
        'input-focus': '0 0 0 3px rgba(20, 184, 166, 0.25)',
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
