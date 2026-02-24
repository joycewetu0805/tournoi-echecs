import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        base: {
          900: '#0D0D0F',
          850: '#11131A',
          800: '#141824',
          700: '#1B2233'
        },
        steel: {
          100: '#E7EDF6',
          300: '#C3CBD8',
          500: '#8A93A4',
          700: '#4B5363'
        },
        accent: {
          400: '#D9C08C',
          500: '#C9A96A'
        },
        neon: {
          400: '#7BE2FF'
        }
      },
      boxShadow: {
        glow: '0 0 24px rgba(123, 226, 255, 0.15)',
        card: '0 24px 80px rgba(0, 0, 0, 0.45)'
      },
      backgroundImage: {
        grid: 'linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(180deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        panel: 'radial-gradient(circle at top, rgba(123,226,255,0.12), transparent 45%), linear-gradient(135deg, rgba(20,24,36,0.9), rgba(13,13,15,0.95))'
      },
      animation: {
        floatSlow: 'floatSlow 12s ease-in-out infinite',
        fadeUp: 'fadeUp 1s ease-out forwards'
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' }
        }
      }
    }
  },
  plugins: []
} satisfies Config;
