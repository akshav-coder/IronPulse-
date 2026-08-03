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
          950: '#F8F9FB', // Main page background (light off-white)
          900: '#FFFFFF', // Card/Sidebar/Header background (white)
          850: '#F1F5F9', // Mid-layer background / grey highlights
          800: '#E2E8F0', // Border lines
          700: '#94A3B8', // Disabled / placeholder text
          600: '#64748B', // Muted text
          500: '#475569', // Medium charcoal text
          400: '#334155', // Regular text
          300: '#1E293B', // Dark charcoal text
          200: '#0F172A', // Heading text
          100: '#020617', // Strong black text
        },
        indigo: {
          700: '#4338CA', // Dark primary indigo
          600: '#4F46E5', // Primary accent indigo
          500: '#6366F1', // Light accent indigo
          400: '#818CF8',
          300: '#A5B4FC',
        },
        cyan: {
          500: '#0D9488', // Dark secondary teal
          400: '#14B8A6', // Secondary accent soft teal
        }
      }
    },
  },
  plugins: [],
}
