/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        emeraldDark: {
          800: '#064e3b',
          900: '#022c22',
          950: '#011913',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        neon: {
          green: '#00ff88',
          blue:  '#00d4ff',
        },
      },
      fontFamily: {
        arabic: ['var(--font-cairo)', 'sans-serif'],
        code:   ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      keyframes: {
        orbit: {
          from: { transform: 'rotate(0deg) translateX(110px) rotate(0deg)' },
          to:   { transform: 'rotate(360deg) translateX(110px) rotate(-360deg)' },
        },
        'border-rotate': {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      animation: {
        orbit:          'orbit 8s linear infinite',
        'border-spin':  'border-rotate 4s ease infinite',
        'text-shimmer': 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [],
};
