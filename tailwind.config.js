/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        nt: {
          blue:   '#2E3192',
          blue2:  '#003399',
          yellow: '#FFD100',
          gray:   '#F5F6FA',
          dark:   '#1A1A2E',
        },
      },
      fontFamily: {
        sans: ['Sarabun', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
