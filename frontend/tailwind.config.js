/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          light: '#F8FAFC',
          dark: '#0F172A',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#020617',
        },
        border: {
          light: '#E5E7EB',
          dark: '#1E293B',
        },
        text: {
          light: '#0F172A',
          dark: '#E5E7EB',
          muted: '#94A3B8',
        },
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
        },
        danger: '#DC2626',
        success: '#16A34A',
        warning: '#D97706',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px rgba(0,0,0,0.08)',
        darkSoft: '0 4px 20px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
