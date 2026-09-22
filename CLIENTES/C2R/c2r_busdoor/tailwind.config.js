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
        'roboto-italic': ['Roboto Italic', 'sans-serif'],
        'roboto-thin': ['Roboto Thin', 'sans-serif'],
        'roboto-light': ['Roboto Light', 'sans-serif'],
        'roboto-medium': ['Roboto Medium', 'sans-serif'],
        'roboto-semibold': ['Roboto Semibold', 'sans-serif'],
        'roboto-bold': ['Roboto Bold', 'sans-serif'],
        'roboto-black': ['Roboto Black', 'sans-serif'],
      },
      fontSize: {
        '10': '10%',
        '15': '15%',
        '20': '20%',
        '30': '30%',
        '40': '40%',
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-in-out',
        'fade-out': 'fadeOut 1s ease-in-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'slide-out-left': 'slideOutLeft 0.5s ease-in',
        'slide-out-right': 'slideOutRight 0.5s ease-in',
        'zoom-in': 'zoomIn 0.5s ease-out',
        'zoom-out': 'zoomOut 0.5s ease-in',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' }
        },
        fadeOut: {
          'from': { opacity: '1' },
          'to': { opacity: '0' }
        },
        slideInLeft: {
          'from': { transform: 'translateX(-100%)' },
          'to': { transform: 'translateX(0)' }
        },
        slideInRight: {
          'from': { transform: 'translateX(100%)' },
          'to': { transform: 'translateX(0)' }
        },
        slideOutLeft: {
          'from': { transform: 'translateX(0)' },
          'to': { transform: 'translateX(-100%)' }
        },
        slideOutRight: {
          'from': { transform: 'translateX(0)' },
          'to': { transform: 'translateX(100%)' }
        },
        zoomIn: {
          'from': { transform: 'scale(0.8)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' }
        },
        zoomOut: {
          'from': { transform: 'scale(1)', opacity: '1' },
          'to': { transform: 'scale(0.8)', opacity: '0' }
        }
      }
    }
  },
  plugins: []
}
