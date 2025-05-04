/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007AFF',
        'dark-grey': '#333333',
        'medium-grey': '#777777',
        'light-grey': '#F2F2F2',
        'accent-orange': '#FF9500',
        white: '#FFFFFF',
      },
      fontFamily: {
        sans: [
          '-apple-system', 
          'BlinkMacSystemFont', 
          '"Segoe UI"', 
          'Roboto', 
          'Oxygen', 
          'Ubuntu', 
          'Cantarell', 
          '"Open Sans"', 
          '"Helvetica Neue"', 
          'sans-serif'
        ],
      },
    },
  },
  plugins: [],
} 