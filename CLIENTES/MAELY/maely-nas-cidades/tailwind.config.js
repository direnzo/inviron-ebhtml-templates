module.exports = {
    content: ['./index.html', './js/*.js'],
    theme: {
        extend: {},
        screens: {
            portrait: { raw: '(max-aspect-ratio: 3/4)' },
            ultrawide: { raw: '(min-aspect-ratio: 3/1)' }
        }
    },
    plugins: []
};