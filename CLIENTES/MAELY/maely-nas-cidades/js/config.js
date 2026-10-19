var CONFIG = {
    debug: false,
    timing: {
        duration: 10000,
        fadeDuration: 350,
        emptyDelay: 120,
        loadTimeout: 5000,
        mediaTimeout: 7000,
        retryDelay: 500,
        maxAttempts: 3
    },
    dataset: {
        name: 'D_NOTICIAS_MAELY',
        category: 'painel news',
        amount: 1
    },
    fields: {
        title: 'TITULO',
        fallbackText: 'TEXTO',
        fallbackFullText: 'TEXTOCOMPLETO',
        photo: 'FOTO'
    },
    typography: {
        titleMinEm: 0.45,
        titleMaxEm: {
            portrait: 2.1,
            landscape: 2.0,
            ultrawide: 1.6
        },
        titleBottomGapVmin: 2.5,
        fitSteps: 10
    },
    layout: {
        safeAreaTopVh: 0,
        safeAreaBottomVh: 0
    },
    colors: {
        accent: '#2F6AFD',
        brand: '#FB5B00',
        text: '#FFFFFF',
        background: '#101010',
        panel: '#2F6AFD'
    }
};

function aplicarConfigVisual() {
    var root = document.documentElement.style;
    var content = document.getElementById('dynamicContent');
    root.setProperty('--cor-destaque', CONFIG.colors.accent);
    root.setProperty('--cor-marca', CONFIG.colors.brand);
    root.setProperty('--cor-texto', CONFIG.colors.text);
    root.setProperty('--cor-fundo', CONFIG.colors.background);
    root.setProperty('--cor-painel', CONFIG.colors.panel);
    if (content) {
        content.style.transitionDuration = CONFIG.timing.fadeDuration + 'ms';
        if (CONFIG.layout.safeAreaTopVh) {
            content.style.top = CONFIG.layout.safeAreaTopVh + 'vh';
        }
        if (CONFIG.layout.safeAreaBottomVh) {
            content.style.bottom = CONFIG.layout.safeAreaBottomVh + 'vh';
        }
    }
}