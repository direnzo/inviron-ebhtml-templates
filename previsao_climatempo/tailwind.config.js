// tailwind.config.js para previsao_climatempo
// Baseado no _template-base e regras de aspect-ratio
module.exports = {
  content: [
    "./**/*.html",
    "./**/*.js",
    "./css/*.css"
  ],
  theme: {
    extend: {
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      screens: {
        'portrait': { 'raw': '(max-aspect-ratio: 3/4)' },
        'square': { 'raw': '(aspect-ratio: 1/1)' },
        'landscape': { 'raw': '(min-aspect-ratio: 4/3) and (max-aspect-ratio: 2/1)' },
        'ultrawide': { 'raw': '(min-aspect-ratio: 3/1)' },
        'superbanner': { 'raw': '(min-aspect-ratio: 5/1) and (max-aspect-ratio: 15/1)' },
        'footer': { 'raw': '(min-aspect-ratio: 15/1)' },
        'empena': { 'raw': '(max-aspect-ratio: 1/3)' }
      }
    }
  },
  plugins: []
};
