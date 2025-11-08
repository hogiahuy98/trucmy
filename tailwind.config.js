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
        primary: '#ff4b6e',
        'primary-light': '#ffd1db',
        'primary-dark': '#ff93a9',
      },
      borderRadius: {
        'xl': '16px',
      },
    },
  },
  plugins: [],
}

