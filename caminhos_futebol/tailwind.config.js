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
        'fade-in':       'fadeIn       0.70s ease-out both',
        'slide-in-top':  'slideInTop   0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pulse-win':     'pulseWin     1.8s  ease-in-out infinite',
        'winner-glow':   'winnerGlow   2.4s  ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to':   { opacity: '1' }
        },
        slideInTop: {
          'from': { transform: 'translateY(-60%)', opacity: '0' },
          'to':   { transform: 'translateY(0)',    opacity: '1' }
        },
        pulseWin: {
          '0%, 100%': { transform: 'scale(1)',    filter: 'brightness(1)   drop-shadow(0 0 0px transparent)' },
          '50%':      { transform: 'scale(1.04)', filter: 'brightness(1.4) drop-shadow(0 0 8px rgba(251,191,36,0.8))' }
        },
        winnerGlow: {
          '0%, 100%': { 'box-shadow': '0 0 0px transparent',           'border-color': 'rgba(251,191,36,0.2)' },
          '50%':      { 'box-shadow': '0 0 12px rgba(251,191,36,0.6)', 'border-color': 'rgba(251,191,36,0.8)' }
        }
      }
    },
    screens: {
      'portrait':    { 'raw': '(max-aspect-ratio: 3/4)' },
      'square':      { 'raw': '(aspect-ratio: 1/1)' },
      'landscape':   { 'raw': '(min-aspect-ratio: 4/3) and (max-aspect-ratio: 2/1)' },
      'ultrawide':   { 'raw': '(min-aspect-ratio: 3/1)' },
      'superbanner': { 'raw': '(min-aspect-ratio: 5/1) and (max-aspect-ratio: 15/1)' },
      'footer':      { 'raw': '(min-aspect-ratio: 15/1)' },
      'empena':      { 'raw': '(max-aspect-ratio: 1/3)' }
    }
  },
  plugins: []
}
