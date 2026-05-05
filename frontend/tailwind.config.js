/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1A1512", // Very dark brown/black
        secondary: "#261D16", // Slightly lighter dark brown
        brown: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#a18072',
          600: '#977669',
          700: '#846358',
          800: '#43302b',
          900: '#2A1E12',
          950: '#1A1512',
        },
        amber: {
          500: '#f59e0b',
          600: '#d97706',
        }
      },
      backgroundImage: {
        'brown-gradient': 'linear-gradient(to right, #846358, #a18072)',
      },
      boxShadow: {
        'brown-glow': '0 0 15px rgba(161, 128, 114, 0.5)',
      }
    },
  },
  plugins: [],
}
