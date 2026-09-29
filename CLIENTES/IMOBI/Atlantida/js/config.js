// =============================================================================
// CONFIG — IMOBI Atlantida (2 noticias simultaneas, D_ATLANTIDA, Roboto Bold)
// Unico lugar para ajuste de tempo, dataset e cores sem tocar em HTML/JS.
// =============================================================================
var CONFIG = {

    debug: true, // desligar em producao

    timing: {
        duration: 10000, // exibicao do par de noticias (ms), configuravel
        fadeDuration: 500
    },

    dataset: {
        name: 'D_ATLANTIDA',
        params: 'amount=2'
    },

    // Fundo com imagem texturizada Atlantida — sem area segura.
    layout: {
        safeAreaTopVh: 0,
        safeAreaBottomVh: 0
    },

    // Cores do modelo Atlantida (fundo escuro texturizado, pilulas de categoria alternadas)
    colors: {
        fundo: '#141414',
        texto: '#ffffff',
        pill0: '#FF4173', // rosa - noticia 1
        pill1: '#F35F38'  // laranja - noticia 2
    },

    // Texto padrao do botao de CTA quando o campo FOOTER nao vier no dataset
    footerText: 'ACESSE ATLANTIDA.COM.BR'
};

// Aplica timing/layout/cores no DOM. Chamar uma vez, antes de revelar o conteudo.
function aplicarConfigVisual() {
    var root = document.documentElement.style;
    root.setProperty('--cor-fundo', CONFIG.colors.fundo);
    root.setProperty('--cor-texto', CONFIG.colors.texto);
    root.setProperty('--cor-pill-0', CONFIG.colors.pill0);
    root.setProperty('--cor-pill-1', CONFIG.colors.pill1);

    var dynamicContent = document.getElementById('dynamicContent');
    if (dynamicContent) {
        dynamicContent.style.transitionDuration = CONFIG.timing.fadeDuration + 'ms';
    }
}
