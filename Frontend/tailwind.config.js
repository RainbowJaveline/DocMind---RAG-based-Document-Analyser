/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        parchment: {
          50: '#FAF9F5',
          100: '#F6F4EE',
          200: '#EEECE4',
          300: '#E1DED3',
          400: '#C8C4B7',
          500: '#9B9685',
          600: '#736E5F',
          700: '#545045',
          800: '#38352D',
          900: '#1F1E19',
        },
        ink: {
          950: '#0B0F15',
          900: '#111720',
          850: '#151D28',
          800: '#1B2432',
          750: '#212D3E',
          700: '#2A384D',
          600: '#415470',
          500: '#647A9B',
          400: '#8E9FB8',
          300: '#B6C4D6',
          200: '#DDE5EE',
          100: '#F0F4F8',
        }
      },
    },
  },
  plugins: [],
}
