/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/context/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: 'var(--app-background)',
          surface: 'var(--app-surface)',
          'surface-secondary': 'var(--app-surface-secondary)',
          border: 'var(--app-border)',
          font: 'var(--app-font-color)',
          muted: 'var(--app-muted)',
          primary: 'var(--app-primary)',
          'primary-hover': 'var(--app-primary-hover)',
          accent: 'var(--app-accent)',
          card: 'var(--app-card)',
          input: 'var(--app-input)',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      fontSize: {
        'app-base': 'var(--app-font-size)',
      },
    },
  },
  plugins: [],
};
