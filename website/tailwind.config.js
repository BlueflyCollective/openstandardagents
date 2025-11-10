/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2B3E96',
          dark: '#1A2B5C',
        },
        secondary: {
          DEFAULT: '#00C9A7',
        },
        success: '#28A745',
        warning: '#FFC107',
        error: '#DC3545',
        info: '#17A2B8',
        gray: {
          100: '#F8F9FA',
          300: '#DEE2E6',
          500: '#6C757D',
          700: '#495057',
          900: '#343A40',
        },
        dark: '#212529',
        code: {
          bg: '#1E1E1E',
          text: '#D4D4D4',
          keyword: '#569CD6',
          string: '#CE9178',
          comment: '#6A9955',
        },
      },
      fontFamily: {
        heading: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        code: ['Fira Code', 'SF Mono', 'Monaco', 'Inconsolata', 'monospace'],
      },
      fontSize: {
        h1: '3rem',
        h2: '2.25rem',
        h3: '1.875rem',
        h4: '1.5rem',
        h5: '1.25rem',
        h6: '1rem',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #2B3E96 0%, #00C9A7 100%)',
        'gradient-hero': 'linear-gradient(180deg, #2B3E96 0%, #1A2B5C 100%)',
      },
    },
  },
  plugins: [],
};

