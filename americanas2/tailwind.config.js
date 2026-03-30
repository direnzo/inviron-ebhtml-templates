/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./**/*.{html,js}"],
    theme: {
        extend: {
            fontFamily: {
                'poppins-bold':    ['Poppins_ExtraBold', 'sans-serif'],
                'poppins-semibold': ['Poppins_SemiBold', 'sans-serif'],
            },
            screens: {
                'portrait':  { 'raw': '(orientation: portrait)' },
                'landscape': { 'raw': '(orientation: landscape)' },
            }
        }
    },
    plugins: []
};
