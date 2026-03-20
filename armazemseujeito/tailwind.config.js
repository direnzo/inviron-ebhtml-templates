/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.html", "./**/*.js", "./css/*.css"],
  corePlugins: {
    textOpacity: true,
    backgroundOpacity: true,
    borderOpacity: true,
    divideOpacity: true,
    placeholderOpacity: true,
    ringOpacity: true,
  },
  theme: {
    extend: {
      fontFamily: {
      'gotham-bold': ['Gotham Bold', 'sans-serif'],
      'gotham-book': ['Gotham Book', 'sans-serif'],

      'gotham-ultra': ['Gotham Ultra', 'sans-serif'],
      'gotham-ultra-italic': ['Gotham Ultra Italic', 'sans-serif'],
      },
      animation: {
        wiggle: 'wiggle 1s ease-in-out infinite',
      },


      backgroundImage: {
        'white-to-blue': "linear-gradient(6deg, rgba(2,0,36,1) 0%, rgba(9,39,121,1) 35%, rgba(0,212,255,1) 100%);"
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
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      },
      animation: {
        pulseScaleWithDelay: 'pulseScaleWithDelay 5s ease-in-out infinite', // Mantém a duração e efeito de escala
      },
      // Define cores explicitamente em hexadecimal para maior compatibilidade
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        white: '#ffffff',
        black: '#000000',
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        red: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        yellow: {
          50: '#fefce8',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
      },
      textShadow: {
        'gold-shadow': '3px 3px 8px rgba(0, 0, 0, 0.8)',  // Sombra mais intensa
      }
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const utilities = {
        '.text-gradient': {
          'background': 'linear-gradient(90deg, #fddb4a 0%, #f09a24 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        '.text-shadow': {
          'text-shadow': '3px 3px 8px rgba(0, 0, 0, 0.8)',  // Sombra mais forte e escura
        },
      }
      // Função helper para converter hex para rgb
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

      // Gera classes com fallbacks para text-white, bg-black, etc
      const colorMap = {
        'white': '#ffffff',
        'black': '#000000',
        'gray-50': '#f9fafb',
        'gray-100': '#f3f4f6',
        'gray-200': '#e5e7eb',
        'gray-300': '#d1d5db',
        'gray-400': '#9ca3af',
        'gray-500': '#6b7280',
        'gray-600': '#4b5563',
        'gray-700': '#374151',
        'gray-800': '#1f2937',
        'gray-900': '#111827',
        'red-500': '#ef4444',
        'red-600': '#dc2626',
        'blue-500': '#3b82f6',
        'green-500': '#22c55e',
        'yellow-500': '#f59e0b',
        'purple-500': '#a855f7',
        'orange-500': '#f97316',
      };

      // Gera fallbacks para cores de texto
      Object.entries(colorMap).forEach(([name, hex]) => {
        utilities[`.text-${name}`] = {
          color: hex,
        };

        utilities[`.text-${name}\\/50`] = {
          color: hex,
          '@supports (color: rgb(255 255 255 / 0.5))': {
            '--tw-text-opacity': '0.5',
            color: `rgb(${hexToRgb(hex)} / var(--tw-text-opacity))`,
          }
        };

        utilities[`.text-${name}\\/75`] = {
          color: hex,
          '@supports (color: rgb(255 255 255 / 0.75))': {
            '--tw-text-opacity': '0.75',
            color: `rgb(${hexToRgb(hex)} / var(--tw-text-opacity))`,
          }
        };
      });

      // Gera fallbacks para cores de background
      Object.entries(colorMap).forEach(([name, hex]) => {
        utilities[`.bg-${name}`] = {
          'background-color': hex,
        };

        utilities[`.bg-${name}\\/50`] = {
          'background-color': hex,
          '@supports (background-color: rgb(255 255 255 / 0.5))': {
            '--tw-bg-opacity': '0.5',
            'background-color': `rgb(${hexToRgb(hex)} / var(--tw-bg-opacity))`,
          }
        };

        utilities[`.bg-${name}\\/75`] = {
          'background-color': hex,
          '@supports (background-color: rgb(255 255 255 / 0.75))': {
            '--tw-bg-opacity': '0.75',
            'background-color': `rgb(${hexToRgb(hex)} / var(--tw-bg-opacity))`,
          }
        };
      });

      // Fallbacks específicos para cores arbitrárias comuns do projeto
      const projectColors = {
        '#a21c26': 'rgb(162, 28, 38)',
        '#ff6c00': 'rgb(255, 108, 0)', // Cor laranja do projeto
        '#ffffff': 'rgb(255, 255, 255)', // Branco
        '#000000': 'rgb(0, 0, 0)', // Preto
      };

      Object.entries(projectColors).forEach(([hex, rgb]) => {
        const escapedHex = hex.replace('#', '\\#');

        utilities[`.bg-\\[${escapedHex}\\]`] = {
          'background-color': hex,
        };

        utilities[`.bg-\\[${escapedHex}\\]\\/50`] = {
          'background-color': hex,
          '@supports (background-color: rgb(255 255 255 / 0.5))': {
            '--tw-bg-opacity': '0.5',
            'background-color': `${rgb.replace('rgb(', 'rgb(').replace(')', '')} / var(--tw-bg-opacity))`,
          }
        };

        utilities[`.bg-\\[${escapedHex}\\]\\/75`] = {
          'background-color': hex,
          '@supports (background-color: rgb(255 255 255 / 0.75))': {
            '--tw-bg-opacity': '0.75',
            'background-color': `${rgb.replace('rgb(', 'rgb(').replace(')', '')} / var(--tw-bg-opacity))`,
          }
        };

        utilities[`.text-\\[${escapedHex}\\]`] = {
          'color': hex,
        };

        utilities[`.text-\\[${escapedHex}\\]\\/50`] = {
          'color': hex,
          '@supports (color: rgb(255 255 255 / 0.5))': {
            '--tw-text-opacity': '0.5',
            'color': `${rgb.replace('rgb(', 'rgb(').replace(')', '')} / var(--tw-text-opacity))`,
          }
        };
      });


      addUtilities(utilities, ['responsive', 'hover'])
    }
  ],
}

