/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js,css}"],
  theme: {
    extend: {
      fontFamily: {
        'roboto-regular': ['Roboto Regular', 'sans-serif'],
        'roboto-medium':  ['Roboto Medium',  'sans-serif'],
        'roboto-bold':    ['Roboto Bold',    'sans-serif'],
        'roboto-black':   ['Roboto Black',   'sans-serif'],
      },
      animation: {
        'fade-in':         'fadeIn 0.7s ease-out both',
        'fade-slide-in':   'fadeSlideIn 0.5s ease-out both',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to':   { opacity: '1' }
        },
        fadeSlideIn: {
          'from': { opacity: '0', transform: 'translateX(-30px)' },
          'to':   { opacity: '1', transform: 'translateX(0)' }
        }
      }
    },
    screens: {
      'portrait':    { 'raw': '(max-aspect-ratio: 3/4)' },
      'square':      { 'raw': '(max-aspect-ratio: 1/1)' },
      'landscape':   { 'raw': '(min-aspect-ratio: 4/3) and (max-aspect-ratio: 2/1)' },
      'ultrawide':   { 'raw': '(min-aspect-ratio: 3/1)' },
      'superbanner': { 'raw': '(min-aspect-ratio: 5/1) and (max-aspect-ratio: 15/1)' },
      'footer':      { 'raw': '(min-aspect-ratio: 15/1)' },
      'empena':      { 'raw': '(max-aspect-ratio: 1/3)' }
    }
  },
  plugins: []
}
