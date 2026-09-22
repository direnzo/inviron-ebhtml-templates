/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./**/*.html",
    "./**/*.js",
    "./css/*.css"
  ],
  theme: {
    extend: {
      fontFamily: {
        'roboto-regular': ['Roboto Regular', 'sans-serif'],
        'roboto-light':   ['Roboto Light', 'sans-serif'],
        'roboto-medium':  ['Roboto Medium', 'sans-serif'],
        'roboto-bold':    ['Roboto Bold', 'sans-serif'],
        'roboto-black':   ['Roboto Black', 'sans-serif'],
        'gotham-book':    ['Gotham Book', 'sans-serif'],
        'futura-bold':    ['Futura Bold BT', 'sans-serif'],
      },
      screens: {
        'portrait':    { 'raw': '(max-aspect-ratio: 3/4)' },
        'square':      { 'raw': '(aspect-ratio: 1/1)' },
        'landscape':   { 'raw': '(min-aspect-ratio: 4/3) and (max-aspect-ratio: 2/1)' },
        'ultrawide':   { 'raw': '(min-aspect-ratio: 3/1)' },
        'superbanner': { 'raw': '(min-aspect-ratio: 5/1) and (max-aspect-ratio: 15/1)' },
        'footer':      { 'raw': '(min-aspect-ratio: 15/1)' },
        'empena':      { 'raw': '(max-aspect-ratio: 1/3)' },
      }
    },
  },
  plugins: [],
}
