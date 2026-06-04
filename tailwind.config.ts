import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{vue,ts,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'var(--ds-canvas)',
        'canvas-soft': 'var(--ds-canvas-soft)',
        'canvas-soft-2': 'var(--ds-canvas-soft-2)',
        ink: 'var(--ds-ink)',
        'ink-body': 'var(--ds-body)',
        'ink-mute': 'var(--ds-mute)',
        'on-primary': 'var(--ds-on-primary)',
        hairline: 'var(--ds-hairline)',
        'hairline-strong': 'var(--ds-hairline-strong)',
        'ds-link': 'var(--ds-link)',
        'ds-error': 'var(--ds-error)',
        'ds-warning': 'var(--ds-warning)',
        'ds-success': 'var(--ds-success)',
        primary: {
          DEFAULT: '#10B981',
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBEF63',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#10B981',
          700: '#059669',
          800: '#047857',
          900: '#065F46'
        },
        secondary: {
          DEFAULT: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A'
        },
        accent: '#F59E0B',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        maxima: '#A855F7'
      },
      backgroundColor: {
        light: '#F8FAFC',
        'light-secondary': '#F1F5F9',
        'light-tertiary': '#E2E8F0'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      spacing: {
        safe: 'env(safe-area-inset-bottom)'
      },
      boxShadow: {
        'card-sm': '0px 1px 1px #00000005, 0px 2px 2px #0000000a, inset 0 0 0 1px #00000014',
        'card': '0px 2px 2px #0000000a, 0px 8px 8px -8px #0000000a, inset 0 0 0 1px #00000014',
        'card-lg': '0px 2px 2px #0000000a, 0px 8px 16px -4px #0000000a, inset 0 0 0 1px #00000014',
        'modal': '0px 1px 1px #00000005, 0px 8px 16px -4px #0000000a, 0px 24px 32px -8px #0000000f, inset 0 0 0 1px #00000014'
      },
      borderRadius: {
        pill: '100px',
        'pill-sm': '64px'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-16px)' }
        }
      },
      animation: {
        float: 'float 4s ease-in-out infinite'
      }
    }
  },
  plugins: []
} satisfies Config
