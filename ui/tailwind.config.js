/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#E0F2F1',
          100: '#B2DFDB',
          300: '#4DB6AC',
          400: '#26A69A',
          600: '#00897B',
        },
        pink: {
          100: '#FCE4EC',
          300: '#F48FB1',
          400: '#EF9A9A',
        },
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          300: '#E0E0E0',
          600: '#757575',
          900: '#212121',
        },
        success: '#4CAF50',
        info: '#26A69A',
        warning: '#FFC107',
        error: '#E53935',
      },
      borderRadius: {
        'lg': '1rem',
        'md': '0.5rem',
        'sm': '0.25rem',
      },
      boxShadow: {
        'sm': '0 1px 4px rgba(0,0,0,0.06)',
        'md': '0 2px 8px rgba(0,0,0,0.10)',
        'lg': '0 4px 16px rgba(0,0,0,0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'h1': '2rem',      // 32px
        'h2': '1.5rem',    // 24px
        'h3': '1.25rem',   // 20px
        'body': '1rem',    // 16px
        'small': '0.875rem', // 14px
      },
      lineHeight: {
        'tight': '1.2',
        'body': '1.5',
      },
      spacing: {
        '0': '0',
        '1': '0.25rem',  // 4px
        '2': '0.5rem',   // 8px
        '3': '0.75rem',  // 12px
        '4': '1rem',     // 16px
        '5': '1.5rem',   // 24px
        '6': '2rem',     // 32px
        '8': '3rem',     // 48px
      },
    },
  },
  plugins: [],
}; 