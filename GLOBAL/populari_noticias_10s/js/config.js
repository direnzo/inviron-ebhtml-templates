var CONFIG = {
    timing: {
        total: 10000,
        textOut: 8800,
        outro: 9200,
        fadeOut: 9650,
        transition: 450,
        dataTimeout: 8000,
        imageTimeout: 6000,
        fontTimeout: 2000,
        fontPoll: 50,
        logoTimeout: 4000
    },
    dataset: {
        name: 'D_POPULARI',
        parameters: '',
        fullTextFields: ['TEXTOCOMPLETO', 'textocompleto', 'TextoCompleto'],
        textFields: ['TEXTO', 'texto', 'Texto'],
        imageFields: ['FOTO', 'foto', 'Foto', 'IMAGEM', 'imagem']
    },
    assets: {
        brandLogo: 'img/logo-dark.svg',
        brandWidth: 205,
        brandHeight: 41
    },
    layout: {
        baseScale: 0.032,
        brandWidthPercent: 76,
        safeInset: 6,
        borderScale: 0.022,
        textMin: 1.05,
        textMax: 2.45,
        fitSteps: 9,
        fitSafety: 2,
        resizeDelay: 100
    },
    colors: {
        background: '#000000',
        brand: '#c85a1a',
        text: '#ffffff',
        opening: '#f4f1ea'
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}