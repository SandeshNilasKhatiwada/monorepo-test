/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EFF7FF',
          100: '#DBEEFF',
          200: '#BFE2FF',
          300: '#93D1FF',
          400: '#60B7FF',
          500: '#208AEF',
          600: '#0B74DE',
          700: '#0A5DB4',
          800: '#0D4F92',
          900: '#114478',
        },
      },
    },
  },
  plugins: [],
};
