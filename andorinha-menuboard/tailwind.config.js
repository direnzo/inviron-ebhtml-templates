/** @type {import('tailwindcss').Config} */
export default {
  content: ["./**/*.html", "./**/*.js", "./css/*.css"],
  theme: {
    extend: {
      fontFamily: {
        'futura-bold': ['Futura Bold', 'sans-serif'],
        'branding-thin': ['Branding Thin', 'sans-serif'],
        'branding-thin-italic': ['Branding Thin Italic', 'sans-serif'],
        'branding-light': ['Branding Light', 'sans-serif'],
        'branding-light-italic': ['Branding Light Italic', 'sans-serif'],
        'branding-semilight': ['Branding Semilight', 'sans-serif'],
        'branding-semilight-italic': ['Branding Semilight Italic', 'sans-serif'],
        'branding-medium': ['Branding Medium', 'sans-serif'],
        'branding-medium-italic': ['Branding Medium Italic', 'sans-serif'],
        'branding-semibold': ['Branding Semibold', 'sans-serif'],
        'branding-semibold-italic': ['Branding Semibold Italic', 'sans-serif'],
        'branding-bold': ['Branding Bold', 'sans-serif'],
        'branding-bold-italic': ['Branding Bold Italic', 'sans-serif'],
        'branding-black': ['Branding Black', 'sans-serif'],
        'branding-black-italic': ['Branding Black Italic', 'sans-serif'],
        'arial-round': ['Arial Rounded MT Bold', 'sans-serif'],
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

