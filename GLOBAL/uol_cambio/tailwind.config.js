/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js,css}"],
  theme: {
    extend: {
      fontFamily: {
        'montserrat-bold':   ['Montserrat Bold', 'sans-serif'],
        'montserrat-medium': ['Montserrat Medium', 'sans-serif'],
      }
    },
    screens: {
      'square':      { 'raw': '(aspect-ratio: 1/1)' },
      'portrait':    { 'raw': '(max-aspect-ratio: 3/4)' },
      'landscape':   { 'raw': '(min-aspect-ratio: 4/3) and (max-aspect-ratio: 2/1)' },
      'ultrawide':   { 'raw': '(min-aspect-ratio: 3/1)' },
      'superbanner': { 'raw': '(min-aspect-ratio: 5/1) and (max-aspect-ratio: 15/1)' },
      'footer':      { 'raw': '(min-aspect-ratio: 15/1)' },
      'empena':      { 'raw': '(max-aspect-ratio: 1/3)' },
    }
  }
}
