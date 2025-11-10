/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Extend with your existing theme colors
        primary: '#8B5CF6',
        'primary-light': '#A78BFA',
        'primary-dark': '#7C3AED',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
        // Purple palette
        purple50: '#F5F3FF',
        purple100: '#EDE9FE',
        purple200: '#DDD6FE',
        purple300: '#C4B5FD',
        purple400: '#A78BFA',
        purple500: '#8B5CF6',
        purple600: '#7C3AED',
        purple700: '#6D28D9',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        xxl: '24px',
      },
    },
  },
  plugins: [],
}

