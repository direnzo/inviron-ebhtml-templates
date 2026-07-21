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
        'google-sans-flex': ['Google Sans Flex', 'sans-serif'],
      },
      screens: {
        'empena':    { 'raw': '(max-aspect-ratio: 1/3)' },                                          // ≤ 0.333
        'portrait':  { 'raw': '(min-aspect-ratio: 1/3) and (max-aspect-ratio: 3/4)' },              // 0.333-0.75
        'square':    { 'raw': '(min-aspect-ratio: 3/4) and (max-aspect-ratio: 4/3)' },              // 0.75-1.333
        'ls':        { 'raw': '(min-aspect-ratio: 4/3) and (max-aspect-ratio: 2/1)' },              // 1.333-2 (landscape puro)
        'ultrawide': { 'raw': '(min-aspect-ratio: 2/1) and (max-aspect-ratio: 5/1)' },              // 2-5
        'superbanner': { 'raw': '(min-aspect-ratio: 5/1) and (max-aspect-ratio: 15/1)' },           // 5-15
        'footer':    { 'raw': '(min-aspect-ratio: 15/1)' }                                          // ≥ 15
      }
    }
  },
  plugins: []
};
