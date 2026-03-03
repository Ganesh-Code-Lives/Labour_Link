/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode using class strategy
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#60a5fa', // Blue 400
          DEFAULT: '#3b82f6', // Blue 500
          dark: '#2563eb', // Blue 600
        },
        secondary: {
          light: '#9ca3af', // Gray 400
          DEFAULT: '#4b5563', // Gray 600
          dark: '#1f2937', // Gray 800
        },
        accent: {
          light: '#fde047', // Yellow 300
          DEFAULT: '#eab308', // Yellow 500
          dark: '#ca8a04', // Yellow 600
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Assuming we use Inter
      }
    },
  },
  plugins: [],
}
