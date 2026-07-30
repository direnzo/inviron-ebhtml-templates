/** @type {import('tailwindcss').Config} */
export default {
  content: ["./**/*.html", "./**/*.js", "./css/*.css"],
  theme: {
    extend: {
      fontFamily: {
        'roboto-medium': ['Roboto Medium', 'sans-serif'],
        'roboto-black': ['Roboto Black', 'sans-serif'],
        'open-sans': ['Open Sans', 'sans-serif'],
        'open-sans-italic': ['Open Sans Italic', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'inter-italic': ['Inter Italic', 'sans-serif'],
        'work': ['Work Sans', 'sans-serif'],
        'work-italic': ['Work Sans Italic', 'sans-serif'],

      },
      fontWeight: {
        thin: '100',
        hairline: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        'extra-bold': '800',
        black: '900',
      },
      fontSize: {
        '30': '30%',
        '40': '40%',
        '15': '15%',
        '20': '20%',
      },
      keyframes: {
        pulseScaleWithDelay: {
          '0%, 20%': {
            transform: 'scale(1)', // Tamanho normal
          },
          '10%': {
            transform: 'scale(1.08)', // Aumenta um pouco
          },
          '100%': {
            transform: 'scale(1)', // Pausa no tamanho original
          },
        },
      },
      animation: {
        pulseScaleWithDelay: 'pulseScaleWithDelay 5s ease-in-out infinite', // Mantém a duração e efeito de escala
      },
    },
  },
  plugins: [],
}

