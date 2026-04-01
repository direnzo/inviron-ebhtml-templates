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
        'carbona-mono': ['Carbona-MonoBoldSlanted', 'monospace'],
      },
      fontSize: {
        '10': '10px',
        '11': '11px',
        '12': '12px',
        '13': '13px',
        '14': '14px',
        '15': '15px',
        '16': '16px',
        '18': '18px',
        '20': '20px',
        '22': '22px',
        '24': '24px',
      },
      spacing: {
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
      },
      colors: {
        'brand-green': '#32A852',
        'brand-red': '#AB0202',
        'brand-blue': '#0D19BA',
        'brand-yellow': '#F5EF00',
        'brand-orange': '#BA4A0D',
        'brand-dark-green': '#1a5f3a',
      },
      width: {
        '312': '312px',
        'screen-312': '312px',
      },
      height: {
        '100': '100px',
        'screen-100': '100px',
      },
      maxWidth: {
        '312': '312px',
      },
      maxHeight: {
        '100': '100px',
      },
      minWidth: {
        '312': '312px',
      },
      minHeight: {
        '100': '100px',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-in-out',
        'fade-out': 'fadeOut 300ms ease-in-out',
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
      },
    },
  },
  plugins: [],
}
