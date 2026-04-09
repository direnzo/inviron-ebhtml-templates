/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}", "./css/input.css"],
  theme: {
    extend: {
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-120%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in':       'fadeIn 1.5s ease forwards',
        'slide-in-left': 'slideInLeft 1.2s ease forwards',
      },
    },
    screens: {
      /* Apenas 2 breakpoints de LAYOUT — tipografia usa vmin (sem breakpoints) */
      'portrait':    { 'raw': '(max-aspect-ratio: 3/4)' },   // cards em coluna
      'superbanner': { 'raw': '(min-aspect-ratio: 5/1)' },   // colapsa em 1 linha
    },
  },
}
