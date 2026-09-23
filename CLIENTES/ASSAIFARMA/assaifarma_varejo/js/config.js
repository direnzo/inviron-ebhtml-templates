// =============================================================================
// CONFIG — variaveis globais do template assaifarma_varejo
// Unico lugar para ajustar tempo, cores, area segura e dataset sem tocar
// na logica de HTML/JS. Editar aqui antes de reabrir o template no player.
// =============================================================================
var CONFIG = {

    // Temporizacao
    timing: {
        duration: 10000,      // tempo de exibicao de cada produto (ms) — playerView/mock
        fadeDuration: 500   // duracao do fade-in do conteudo (ms)
    },

    // Dataset EBHTML (ver ebhtml-api SKILL para o significado dos filtros)
    dataset: {
        name: 'D_SPD',
        typeFilter: 4  // f_type usado na consulta inicial de projetos especiais (playerView)
    },

    // Area segura do fundo — calibrada pelo cabecalho/rodape fixos da imagem de fundo.
    // Se o fundo mudar de arte, recalcular: (altura do cabecalho em px / altura total do fundo em px) * 100.
    layout: {
        safeAreaTopVh: 22.685,   // 245px de 1080px de altura do fundo
        safeAreaBottomVh: 11.111 // 120px de 1080px de altura do fundo
    },

    // Cores aplicadas via CSS custom properties (--cor-preco/--cor-texto em :root)
    colors: {
        preco: '#dc2626', // cor do preco em destaque (equivalente ao tailwind red-600)
        texto: '#000000'  // cor do titulo/labels sobre a area branca do fundo
    }
};

// Aplica timing/layout/cores no DOM. Chamar uma vez, antes de revelar o conteudo.
function aplicarConfigVisual() {
    var root = document.documentElement.style;
    root.setProperty('--cor-preco', CONFIG.colors.preco);
    root.setProperty('--cor-texto', CONFIG.colors.texto);

    var fullContent = document.getElementById('fullContent');
    var logoContainer = document.getElementById('logo_container');
    if (fullContent) {
        fullContent.style.top = CONFIG.layout.safeAreaTopVh + 'vh';
        fullContent.style.bottom = CONFIG.layout.safeAreaBottomVh + 'vh';
        fullContent.style.transitionDuration = CONFIG.timing.fadeDuration + 'ms';
    }
    if (logoContainer) {
        logoContainer.style.height = CONFIG.layout.safeAreaTopVh + 'vh';
        logoContainer.style.transitionDuration = CONFIG.timing.fadeDuration + 'ms';
    }
}
