// =============================================================================
// CONFIG — variaveis globais do template. Unico lugar para o editor ajustar
// tempo, dataset, area segura e cores sem tocar na logica de HTML/JS.
// Ver .github/copilot-instructions.md secao 5 para o padrao completo.
// =============================================================================
var CONFIG = {

    debug: true, // liga logs [Base] no console; desligar em producao

    // Temporizacao
    timing: {
        duration: 15000,  // tempo de exibicao do item (ms) — sobrescrito pelo campo DURATION do dataset, se houver
        fadeDuration: 500 // duracao do fade-in do conteudo dinamico (ms)
    },

    // Dataset EBHTML
    dataset: {
        name: 'D_INSTITUCIONAL'
    },

    // Area segura do fundo — preencher só se a arte tiver cabecalho/rodape fixos.
    // Calculo: (altura do cabecalho ou rodape em px / altura total do fundo em px) * 100.
    layout: {
        safeAreaTopVh: 0,
        safeAreaBottomVh: 0
    },

    // Cores aplicadas via CSS custom properties (--cor-destaque/--cor-texto em :root)
    colors: {
        destaque: '#ffffff',
        texto: '#ffffff'
    }
};

// Aplica timing/layout/cores no DOM. Chamar uma vez, antes de revelar o conteudo dinamico.
function aplicarConfigVisual() {
    var root = document.documentElement.style;
    root.setProperty('--cor-destaque', CONFIG.colors.destaque);
    root.setProperty('--cor-texto', CONFIG.colors.texto);

    var dynamicContent = document.getElementById('dynamicContent');
    if (dynamicContent) {
        if (CONFIG.layout.safeAreaTopVh) { dynamicContent.style.top = CONFIG.layout.safeAreaTopVh + 'vh'; }
        if (CONFIG.layout.safeAreaBottomVh) { dynamicContent.style.bottom = CONFIG.layout.safeAreaBottomVh + 'vh'; }
        dynamicContent.style.transitionDuration = CONFIG.timing.fadeDuration + 'ms';
    }
}
