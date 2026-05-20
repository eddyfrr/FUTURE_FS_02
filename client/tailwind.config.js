/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0a0a0f',
          50: '#f5f5f7',
          100: '#e8e8ee',
          200: '#c5c5d2',
          300: '#9b9bae',
          400: '#6e6e85',
          500: '#4a4a5e',
          600: '#2e2e3e',
          700: '#1c1c28',
          800: '#13131c',
          900: '#0a0a0f',
        },
        brand: {
          violet: '#8b5cf6',
          pink: '#ec4899',
          cyan: '#06b6d4',
          amber: '#fbbf24',
          green: '#10b981',
          red: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(139, 92, 246, 0.4)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.08)',
      },
    },
  },
  plugins: [],
};
