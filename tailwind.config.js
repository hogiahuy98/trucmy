/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Avocado Warm color system
        'avocado-green': '#A3C68C',
        'deep-avocado': '#6F8F5F',
        sage: '#D8E2D0',
        cream: '#FAF8F4',
        'warm-linen': '#EFECE6',
        'coral-soft': '#E69D87',
        'dark-olive': '#4A4F3B',
        'olive-grey': '#8B8F7A',
        // Legacy support
        primary: '#A3C68C',
        'primary-light': '#D8E2D0',
        'primary-dark': '#6F8F5F',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

