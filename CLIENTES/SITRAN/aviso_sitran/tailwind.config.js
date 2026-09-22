/** @type {import('tailwindcss').Config} */
export default {
  content: ["./**/*.html", "./**/*.js", "./css/*.css"],
  theme: {
    extend: {
      fontFamily: {
        'opensans': ['Open Sans', 'sans-serif'],
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
        '10': '10%',
        '15': '15%',
        '20': '20%',
        '30': '30%',
        '40': '40%',
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
      colors: {
        'gold-start': '#fddb4a',  // Cor inicial amarela
        'gold-end': '#f09a24',    // Cor final mais laranja/dourada
      },
      textShadow: {
        'gold-shadow': '3px 3px 8px rgba(0, 0, 0, 0.8)',  // Sombra mais intensa
      }
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.text-gradient': {
          'background': 'linear-gradient(90deg, #fddb4a 0%, #f09a24 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        '.text-shadow': {
          'text-shadow': '3px 3px 8px rgba(0, 0, 0, 0.8)',  // Sombra mais forte e escura
        },
      }

      addUtilities(newUtilities, ['responsive', 'hover'])
    }
  ],
}

