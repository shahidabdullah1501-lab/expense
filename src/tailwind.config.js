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
        // User's Aesthetic Minimalist Palette
        palette: {
          cream: '#FAFAEB',    // FAFAEB: Warm Ivory / Canvas Base
          lavender: '#F3E4F1', // F3E4F1: Soft Lilac / Lavender Pearl
          sage: '#D5EBDA',     // D5EBDA: Soft Mint / Sage Green (Income & Growth)
          peach: '#F4DACD',    // F4DACD: Warm Apricot / Soft Peach (Warnings & Discretionary)
          blush: '#EAD3D4',    // EAD3D4: Dusty Rose / Soft Blush (Expenses & Health)
        },
        cream: {
          50: '#FFFFFF',
          100: '#FAFAEB',
          200: '#F4F4DB',
          300: '#EBEBC4',
          400: '#DFDF9C',
          500: '#CFCF70',
        },
        lavender: {
          DEFAULT: '#F3E4F1',
          50: '#FCF8FC',
          100: '#F3E4F1',
          200: '#E6C6E1',
          300: '#D5A4CD',
          400: '#C07EB7',
          500: '#A45899',
          900: '#4A1D44',
        },
        sage: {
          DEFAULT: '#D5EBDA',
          50: '#F4FAF5',
          100: '#D5EBDA',
          200: '#B2DCBC',
          300: '#8CCA9A',
          400: '#64B276',
          500: '#3D9251',
          900: '#144620',
        },
        peach: {
          DEFAULT: '#F4DACD',
          50: '#FDF7F4',
          100: '#F4DACD',
          200: '#EABCA4',
          300: '#DE9978',
          400: '#CE744B',
          500: '#AC522B',
          900: '#52200B',
        },
        blush: {
          DEFAULT: '#EAD3D4',
          50: '#FAF5F5',
          100: '#EAD3D4',
          200: '#D7AEB0',
          300: '#C28487',
          400: '#A85E62',
          500: '#8B4246',
          900: '#44181B',
        },
        aesthetic: {
          bg: '#FAFAEB',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          cardHover: '#FCFCF7',
          border: 'rgba(28, 25, 23, 0.08)',
          borderHover: 'rgba(28, 25, 23, 0.15)',
          text: '#1C1917',
          muted: '#78716C',
          subtle: '#A8A29E',
        }
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(28, 25, 23, 0.05)',
        'card': '0 1px 3px rgba(28, 25, 23, 0.04), 0 6px 18px -3px rgba(28, 25, 23, 0.04)',
        'card-hover': '0 4px 12px rgba(28, 25, 23, 0.06), 0 12px 28px -4px rgba(28, 25, 23, 0.06)',
        'dropdown': '0 10px 25px -5px rgba(28, 25, 23, 0.08), 0 0 1px 1px rgba(28, 25, 23, 0.06)',
        'input-focus': '0 0 0 3px rgba(213, 235, 218, 0.7)',
        'glow-pastel': '0 0 20px -3px rgba(243, 228, 241, 0.6)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}
