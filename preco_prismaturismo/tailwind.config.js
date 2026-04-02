/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./**/*.html",
    "./**/*.js",
    "./css/*.css"
  ],
  theme: {
    extend: {
      keyframes: {
        slideDown: {
          '0%':   { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)',      opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        punchIn: {
          '0%':   { transform: 'scale(1.3)', opacity: '0' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        fadeLeft: {
          '0%':   { transform: 'translateX(-16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',     opacity: '1' },
        },
        pricePulse: {
          '0%,100%': { transform: 'scale(1)' },
          '50%':     { transform: 'scale(1.06)' },
        },
      },
      animation: {
        'slide-down': 'slideDown 0.55s cubic-bezier(0.22,1,0.36,1) forwards',
        'slide-up':   'slideUp  0.55s cubic-bezier(0.22,1,0.36,1) forwards',
        'punch-in':   'punchIn  0.65s cubic-bezier(0.22,1,0.36,1) forwards',
        'fade-left':  'fadeLeft 0.4s ease-out forwards',
        'price-pulse':'pricePulse 1.8s ease-in-out 3',
      },
    },
  },
  plugins: []
}
