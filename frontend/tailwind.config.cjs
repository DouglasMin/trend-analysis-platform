/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: 'var(--ink-900)',
          800: 'var(--ink-800)',
          700: 'var(--ink-700)',
          200: 'var(--ink-200)',
          100: 'var(--ink-100)',
        },
        accent: {
          500: 'var(--accent-500)',
          600: 'var(--accent-600)',
          700: 'var(--accent-700)',
        },
        aqua: {
          400: 'var(--aqua-400)',
          500: 'var(--aqua-500)',
        },
        paper: 'var(--paper)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
