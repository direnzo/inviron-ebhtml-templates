/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}", "./css/input.css"],
  theme: {
    extend: {
      fontFamily: {
        'heebo-bold': ['Heebo Bold', 'sans-serif'],
      }
    },
    screens: {
      'portrait':    { 'raw': '(max-aspect-ratio: 3/4)' },
      'square':      { 'raw': '(min-aspect-ratio: 3/4) and (max-aspect-ratio: 4/3)' },
      'empena':      { 'raw': '(max-aspect-ratio: 1/3)' },
      'ultrawide':   { 'raw': '(min-aspect-ratio: 3/1)' },
      'superbanner': { 'raw': '(min-aspect-ratio: 5/1) and (max-aspect-ratio: 15/1)' },
      'footer':      { 'raw': '(min-aspect-ratio: 15/1) and (max-aspect-ratio: 50/1)' },
    }
  },
  plugins: []
}
