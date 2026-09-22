/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}", "./css/input.css"],
  theme: {
    extend: {
      fontFamily: {
        'open-sans-bold': ['Open Sans Bold', 'sans-serif'],
        'open-sans-regular': ['Open Sans Regular', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pan-fundo': {
          '0%':   { 'background-position': '0% 50%' },
          '100%': { 'background-position': '100% 50%' },
        },
      },
      animation: {
        'fade-in': 'fade-in 1s 1s forwards',
        'pan-fundo': 'pan-fundo 25s linear forwards',
      },
    },
    screens: {
      'square':      { 'raw': '(aspect-ratio: 1/1)' },
      'portrait':    { 'raw': '(max-aspect-ratio: 3/4)' },
      'landscape':   { 'raw': '(min-aspect-ratio: 4/3) and (max-aspect-ratio: 2/1)' },
      'ultrawide':   { 'raw': '(min-aspect-ratio: 3/1)' },
      'superbanner': { 'raw': '(min-aspect-ratio: 5/1) and (max-aspect-ratio: 15/1)' },
      'footer':      { 'raw': '(min-aspect-ratio: 15/1) and (max-aspect-ratio: 50/1)' },
      'empena':      { 'raw': '(max-aspect-ratio: 1/3)' },
      'xs':  '480px',
      'sm':  '640px',
      'md':  '768px',
      'lg':  '1024px',
      'xl':  '1280px',
      '2xl': '1536px',
    },
  }
}
