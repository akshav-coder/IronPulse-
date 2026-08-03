/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#222222', // Main background from image
          900: '#2b2b2b', // Card/Sidebar background (slightly lighter for elevation contrast)
          850: '#333333', // Mid-layer cards
          800: '#3c3c3c', // Borders
          700: '#4a4a4a',
          600: '#5c5c5c',
          500: '#8c8c8c',
          400: '#a3a3a3',
          300: '#e5e5e5',
          200: '#FFF3E2', // Soft warm white text
          100: '#FFF3E2', // Warm cream white text
        },
        indigo: {
          700: '#e38b34',
          600: '#FBAB57', // Accent orange
          500: '#FEC674', // Accent light orange
          400: '#FEC674',
          300: '#ffe5c2',
        },
        cyan: {
          500: '#FEC674',
          400: '#FEC674',
        }
      }
    },
  },
  plugins: [],
}
