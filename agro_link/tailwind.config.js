/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./**/*.html",
    "./**/*.js",
    "./css/*.css"
  ],
  theme: {
    extend: {
      fontFamily: {
        'mmc-regular': ['MMC-Regular', 'sans-serif'],
        'mmc-medium': ['MMC-Medium', 'sans-serif'],
        'mmc-bold': ['MMC-Bold', 'sans-serif'],
      },
      screens: {
        'portrait': { 'raw': '(max-aspect-ratio: 3/4)' },
        'landscape': { 'raw': '(min-aspect-ratio: 4/3) and (max-aspect-ratio: 2/1)' },
      }
    },
  },
  plugins: [],
};