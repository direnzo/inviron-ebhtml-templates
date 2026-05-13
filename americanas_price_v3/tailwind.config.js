/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./**/*.{html,js}"],
    // Garante que os plugins de opacidade usem o sistema de variáveis legado,
    // compatível com WebKit antigo (Android 7+)
    corePlugins: {
        textOpacity: true,
        backgroundOpacity: true,
        borderOpacity: true,
    },
    theme: {
        extend: {
            fontFamily: {
                'roboto-flex': ['Roboto Flex', 'sans-serif'],
                'helvetica-neue': ['Helvetica Neue', 'sans-serif'],
            },
            screens: {
                'portrait':  { 'raw': '(orientation: portrait)' },
                'landscape': { 'raw': '(orientation: landscape)' },
            },
            keyframes: {
                pulseScaleWithDelay: {
                    '0%, 20%': { transform: 'scale(1)' },
                    '10%':     { transform: 'scale(1.08)' },
                    '100%':    { transform: 'scale(1)' },
                },
            },
            animation: {
                pulseScaleWithDelay: 'pulseScaleWithDelay 5s ease-in-out infinite',
            },
            // Cores explícitas em HEX — WebKit legado não suporta oklch nem rgb(R G B / var(...))
            colors: {
                transparent: 'transparent',
                current: 'currentColor',
                white: '#ffffff',
                black: '#000000',
                red: {
                    50:  '#fef2f2',
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
            },
        }
    },
    plugins: [
        function({ addUtilities }) {
            // Fallback WebKit: substitui rgb(R G B / var(--tw-xxx-opacity)) por HEX simples
            // para as cores arbitrárias usadas no projeto
            var projectColors = {
                '#ed0030': 'rgb(237, 0, 48)',
                '#ffffff': 'rgb(255, 255, 255)',
                '#000000': 'rgb(0, 0, 0)',
            };

            var utilities = {};

            Object.keys(projectColors).forEach(function(hex) {
                var rgb = projectColors[hex];
                var escapedHex = hex.replace('#', '\\#');

                // bg-[#hex]
                utilities['.bg-\\[' + escapedHex + '\\]'] = {
                    'background-color': hex,
                };
                // text-[#hex]
                utilities['.text-\\[' + escapedHex + '\\]'] = {
                    'color': hex,
                };
            });

            // Garante que text-white, text-black, bg-white saiam como HEX simples
            utilities['.text-white'] = { 'color': '#ffffff' };
            utilities['.text-black'] = { 'color': '#000000' };
            utilities['.bg-white']   = { 'background-color': '#ffffff' };
            utilities['.bg-black']   = { 'background-color': '#000000' };

            addUtilities(utilities);
        }
    ]
};
