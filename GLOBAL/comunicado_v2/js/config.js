// =============================================================================
// CONFIG - valores PADRAO do template. Cada campo de CONFIG.visual pode ser
// sobrescrito pelo registro de D_COMUNICADO (ver README: contrato de campos).
// Campo ausente, vazio ou invalido no canal => vale o padrao definido aqui.
// =============================================================================
var CONFIG = {

    debug: false, // liga logs [Comunicado] no console

    // Temporizacao
    timing: {
        duration: 30000,   // exibicao padrao (ms) - sobrescrito por DURACAO (segundos) do canal
        minSeconds: 3,     // limites aceitos para DURACAO
        maxSeconds: 300,
        fadeDuration: 500  // fade-in do conteudo (ms)
    },

    // Dataset EBHTML
    dataset: {
        name: 'D_COMUNICADO'
    },

    // Area segura do fundo (0 = tela inteira)
    layout: {
        safeAreaTopVh: 0,
        safeAreaBottomVh: 0
    },

    // Visual padrao (espelha os campos do canal)
    visual: {
        bg: {
            type: 'gradient',    // BG_TIPO: 'gradient' | 'solid'
            color: '#0d1b2a',    // BG_COR (chapado)
            from: '#0d1b2a',     // BG_COR_DE
            to: '#1d2f4d',       // BG_COR_PARA
            angle: 135,          // BG_ANGULO (0-360)
            glow: true           // BG_BRILHO
        },
        accent: '#f58220',       // COR_DESTAQUE
        line: true,              // FILETE
        title: {
            color: '#ffffff',    // TITULO_COR
            box: false,          // TITULO_CAIXA
            boxColor: '#f58220', // TITULO_CAIXA_COR
            boxOpacity: 100,     // TITULO_CAIXA_OPACIDADE (0-100 %)
            radius: 27           // TITULO_CAIXA_RAIO (0-100; 100 = 1.5em)
        },
        desc: {
            color: '#ffffff',    // DESC_COR
            box: false,          // DESC_CAIXA
            boxColor: '#000000', // DESC_CAIXA_COR
            boxOpacity: 35,      // DESC_CAIXA_OPACIDADE
            radius: 27           // DESC_CAIXA_RAIO
        }
    }
};

function hexToRgba(hex, alpha) {
    return 'rgba(' + parseInt(hex.substr(1, 2), 16) + ',' + parseInt(hex.substr(3, 2), 16) + ',' + parseInt(hex.substr(5, 2), 16) + ',' + alpha + ')';
}

// Aplica o visual (ja validado por master.js) no DOM. Chamar antes de revelar o conteudo.
function aplicarConfigVisual(v) {
    var stage = document.getElementById('stage');
    var root = document.documentElement.style;
    var titleBox = document.getElementById('titlebox');
    var descBox = document.getElementById('descbox');

    stage.style.background = v.bg.type === 'solid'
        ? v.bg.color
        : 'linear-gradient(' + v.bg.angle + 'deg, ' + v.bg.from + ', ' + v.bg.to + ')';
    stage.style.transitionDuration = CONFIG.timing.fadeDuration + 'ms';
    root.setProperty('--accent', v.accent);
    root.setProperty('--rt', (v.title.radius * 0.015) + 'em');
    root.setProperty('--rd', (v.desc.radius * 0.015) + 'em');

    document.getElementById('title').style.color = v.title.color;
    document.getElementById('desc').style.color = v.desc.color;
    titleBox.style.background = v.title.box ? hexToRgba(v.title.boxColor, v.title.boxOpacity / 100) : 'none';
    descBox.style.background = v.desc.box ? hexToRgba(v.desc.boxColor, v.desc.boxOpacity / 100) : 'none';

    if (CONFIG.layout.safeAreaTopVh) { stage.style.top = CONFIG.layout.safeAreaTopVh + 'vh'; }
    if (CONFIG.layout.safeAreaBottomVh) { stage.style.bottom = CONFIG.layout.safeAreaBottomVh + 'vh'; }
}
