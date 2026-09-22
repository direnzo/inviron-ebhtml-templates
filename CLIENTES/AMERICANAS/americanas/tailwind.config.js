/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'transire-green': '#01595b',
        'transire-red': '#d54030',
      },
      fontFamily: {
        'poppins-extrabold': ['Poppins_ExtraBold', 'sans-serif'],
        'poppins-semibold': ['Poppins_SemiBold', 'sans-serif'],
      },
      letterSpacing: {
        'wider-2': '2px',
      },
      animation: {
        'fade-in': 'fadeIn 1.5s ease-out forwards',
        'fade-in-delay-1': 'fadeIn 1.5s 1s ease-out forwards',
        'fade-in-delay-1.2': 'fadeIn 1.5s 1.2s ease-out forwards',
        'fade-in-delay-1.3': 'fadeIn 1.5s 1.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      screens: {
        'portrait': { 'raw': '(orientation: portrait)' },
        'landscape': { 'raw': '(orientation: landscape)' },
      },
    },
  },
  plugins: [
    // Plugin para fallbacks de cores para navegadores antigos
    function ({ addUtilities }) {
      const utilities = {};

      // Função helper para converter hex para rgb (compatibilidade)
      function hexToRgb(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) {
          hex = hex.split('').map(char => char + char).join('');
        }
        const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
          : '0 0 0';
      }

      // Cores essenciais do projeto com fallbacks
      const projectColors = {
        'white': '#ffffff',
        'black': '#000000',
        'transire-green': '#01595b',
        'transire-red': '#d54030',
      };

      // Criar fallbacks para cores de texto com suporte a opacidade
      Object.entries(projectColors).forEach(([name, hex]) => {
        // Cor sólida (fallback para navegadores antigos)
        utilities[`.text-${name}`] = {
          color: hex,
        };

        // Opacidade 50% com fallback
        utilities[`.text-${name}\\/50`] = {
          color: hex,
          '@supports (color: rgb(255 255 255 / 0.5))': {
            '--tw-text-opacity': '0.5',
            color: `rgb(${hexToRgb(hex)} / var(--tw-text-opacity))`,
          }
        };

        // Opacidade 75% com fallback
        utilities[`.text-${name}\\/75`] = {
          color: hex,
          '@supports (color: rgb(255 255 255 / 0.75))': {
            '--tw-text-opacity': '0.75',
            color: `rgb(${hexToRgb(hex)} / var(--tw-text-opacity))`,
          }
        };
      });

      // Criar fallbacks para cores de background com suporte a opacidade
      Object.entries(projectColors).forEach(([name, hex]) => {
        // Cor sólida (fallback para navegadores antigos)
        utilities[`.bg-${name}`] = {
          'background-color': hex,
        };

        // Opacidade 50% com fallback
        utilities[`.bg-${name}\\/50`] = {
          'background-color': hex,
          '@supports (background-color: rgb(255 255 255 / 0.5))': {
            '--tw-bg-opacity': '0.5',
            'background-color': `rgb(${hexToRgb(hex)} / var(--tw-bg-opacity))`,
          }
        };

        // Opacidade 90% com fallback
        utilities[`.bg-${name}\\/90`] = {
          'background-color': hex,
          '@supports (background-color: rgb(255 255 255 / 0.9))': {
            '--tw-bg-opacity': '0.9',
            'background-color': `rgb(${hexToRgb(hex)} / var(--tw-bg-opacity))`,
          }
        };
      });

      // Fallbacks para cores arbitrárias do projeto
      utilities['.bg-\\[\\#01595b\\]'] = {
        'background-color': '#01595b',
      };

      utilities['.text-\\[\\#01595b\\]'] = {
        'color': '#01595b',
      };

      utilities['.bg-\\[\\#d54030\\]'] = {
        'background-color': '#d54030',
      };

      utilities['.text-\\[\\#d54030\\]'] = {
        'color': '#d54030',
      };

      addUtilities(utilities);
    }
  ],
}