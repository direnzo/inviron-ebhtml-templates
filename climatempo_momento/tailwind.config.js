// tailwind.config.js para climatempo_momento
module.exports = {
  content: [
    "./index.html",
    "./js/*.js",
    "./css/*.css"
  ],
  theme: {
    extend: {
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      screens: {
        'empena':    { 'raw': '(max-aspect-ratio: 1/3)' },
        'portrait':  { 'raw': '(min-aspect-ratio: 1/3) and (max-aspect-ratio: 3/4)' },
        'square':    { 'raw': '(min-aspect-ratio: 3/4) and (max-aspect-ratio: 4/3)' },
        'ls':        { 'raw': '(min-aspect-ratio: 4/3) and (max-aspect-ratio: 2/1)' },
        'ultrawide': { 'raw': '(min-aspect-ratio: 2/1) and (max-aspect-ratio: 5/1)' },
        'superbanner': { 'raw': '(min-aspect-ratio: 5/1) and (max-aspect-ratio: 15/1)' },
        'footer':    { 'raw': '(min-aspect-ratio: 15/1)' }
      }
    }
  },
  plugins: []
};