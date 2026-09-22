/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./js/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Roboto Regular', 'sans-serif'],
      },
      animation: {
        'fade-in':  'fadeIn 0.6s ease-in-out',
        'fade-out': 'fadeOut 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeOut: { from: { opacity: '1' }, to: { opacity: '0' } },
      },
    },
    screens: {
      'portrait':    { raw: '(max-aspect-ratio: 3/4)' },
      'empena':      { raw: '(max-aspect-ratio: 1/3)' },
      'superbanner': { raw: '(min-aspect-ratio: 5/1) and (max-aspect-ratio: 15/1)' },
      'ultrawide':   { raw: '(min-aspect-ratio: 3/1)' },
    },
  },
  plugins: [],
}
