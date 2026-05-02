/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#FF5C00', dark: '#E65200', light: '#FFF3EE' },
      },
      fontFamily: { sans: ['Be Vietnam Pro', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
