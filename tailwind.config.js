/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7c6af7',
        surface: '#141416',
        card: '#1c1c1e',
        border: '#2a2a2e',
        muted: '#8e8e93',
        income: '#32d74b',
        expense: '#ff453a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
