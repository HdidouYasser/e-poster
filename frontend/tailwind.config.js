/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          primary: 'var(--theme-primary)',
          'primary-hover': 'var(--theme-primary-hover)',
          hover: 'var(--theme-primary-hover)',
          light: 'var(--theme-primary-light)',
          foreground: 'var(--theme-foreground)',
          secondary: 'var(--theme-secondary)',
          'secondary-hover': 'var(--theme-secondary-hover)',
          'secondary-foreground': 'var(--theme-secondary-foreground)',
          'bg-light': 'var(--theme-bg-light)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      boxShadow: {
        'soft': '0 20px 40px -15px rgba(0,0,0,0.05)',
      }
    },
  },
  plugins: [],
}
