/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js,css}"],
  theme: {
    extend: {
      fontFamily: {
        'poppins-medium': ['Poppins Medium', 'sans-serif'],
        'poppins-bold': ['Poppins Bold', 'sans-serif'],
        'poppins-regular': ['Poppins Regular', 'sans-serif'],
      },
    },
    screens: {
      'square': { 'raw': '(aspect-ratio: 1/1)' },
      'portrait': { 'raw': '(max-aspect-ratio: 3/4)' }, // 9:16, 1:2, etc
      'landscape': { 'raw': '(min-aspect-ratio: 4/3) and (max-aspect-ratio: 2/1)' }, // 16:9, 2:1
      'ultrawide': { 'raw': '(min-aspect-ratio: 3/1)' }, // 3:1 ou mais largo
      'superbanner': { 'raw': '(min-aspect-ratio: 5/1) and (max-aspect-ratio: 15/1)' }, // 4:1 pode existir, é mais largo que 3:1
      'footer': { 'raw': '(min-aspect-ratio: 15/1) and (max-aspect-ratio: 50/1)' }, 
      'empena': { 'raw': '(max-aspect-ratio: 1/3)' }, // 1:2 ou mais estreito
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  }
}

