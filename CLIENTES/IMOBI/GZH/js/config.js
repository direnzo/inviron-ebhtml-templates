var CONFIG = {
    debug: false,
    timing: {
        duration: 10000,
        fadeDuration: 600,
        ctaDelay: 5000,
        emptyFinishDelay: 100
    },
    dataset: {
        name: 'D_GZH',
        params: 'amount=2'
    },
    layout: {
        safeAreaTopVh: 0,
        safeAreaBottomVh: 0,
        titleFit: {
            horizontalMinEm: 1.15,
            horizontalMaxEm: 1.65,
            portraitMinEm: 0.82,
            portraitMaxEm: 1.2
        }
    },
    colors: {
        background: '#000000',
        text: '#ffffff',
        category: '#D15138',
        categoryText: '#000000'
    },
    assets: {
        logo: 'img/gzh-logo-tagline.png',
        photoFallback: 'img/placeholder.jpg'
    },
    footerText: 'Acesse GZH.COM.BR e acompanhe os canais digitais em @gzhdigital'
};

function aplicarConfigVisual() {
    var root = document.documentElement.style;
    root.setProperty('--cor-fundo', CONFIG.colors.background);
    root.setProperty('--cor-texto', CONFIG.colors.text);
    root.setProperty('--cor-editoria', CONFIG.colors.category);
    root.setProperty('--cor-editoria-texto', CONFIG.colors.categoryText);
    root.setProperty('--area-segura-topo', CONFIG.layout.safeAreaTopVh + 'vh');
    root.setProperty('--area-segura-rodape', CONFIG.layout.safeAreaBottomVh + 'vh');
    var dynamicContent = document.getElementById('dynamicContent');
    if (dynamicContent) { dynamicContent.style.transitionDuration = CONFIG.timing.fadeDuration + 'ms'; }
}
