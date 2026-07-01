/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enables toggleable dark mode
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#3b82f6', // blue-500
          secondary: '#8b5cf6', // purple-500
          success: '#10b981', // emerald-500
          danger: '#ef4444', // red-500
        },
        surface: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      }
    },
  },
  plugins: [],
}