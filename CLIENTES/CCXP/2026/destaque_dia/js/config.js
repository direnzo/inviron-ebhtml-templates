// =============================================================================
// CONFIG - tudo o que se ajusta no template Destaque do Dia (um pacote para os 6 palcos).
// Medidas em px na tela 1080x1920. Texto: y = linha de base da 1a linha, tam = fonte (px).
// Fonte: Materiais/02_Template-Destaque-Dia/Exports/layout-destaques.json (modelo .ai, 2026-10-13).
// =============================================================================
const CONFIG = {
    debug: true, // logs [CCXP]; desligar em producao

    dataset: 'D_CCXP_DESTAQUES',
    basePath: 'http://localhost:13199/CONTENT/DATA', // mesmo caminho de 2025 (a porta 13199 libera CORS)
    fuso: -180,   // minutos; datas sem fuso no dataset sao lidas em Sao Paulo

    // Marcador de destaque no registro (campo TEXTO2, como em 2025). Pergunta 1 do plano: confirmar.
    marcador: '1',
    maxDestaques: 6, // slides por ciclo (0 = sem limite). Pergunta 2 do plano: confirmar.

    // Todos os tempos em ms.
    tempos: {
        // -- quanto cada etapa fica em tela (a entrada/saida esta dentro do tempo do slide)
        intro: 3000,     // video de abertura (duracao do arquivo)
        destaque: 5166,  // cada slide. Pergunta 3 do plano: 6 s (escopo) ou 5 s (2025)
        outro: 11000,    // video de encerramento (duracao do arquivo)
        // -- animacao em camadas (como 2025): fundo faz fade, conteudo entra pela direita depois
        fadeFundo: 1000,        // fade do fundo do slide (entrada e saida)
        entrada: 1000,          // conteudo entra pela direita e sai pela esquerda
        conteudoDelay: 300,     // fundo comeca, o conteudo entra depois deste atraso
        saidaFundoDelay: 300,   // conteudo comeca a sair, o fundo some depois deste atraso
        fadeAbertura: 300,      // video de abertura some quando o slide entra
        fadeEncerramento: 500,  // video de encerramento entra
        pausaEncerramento: 150, // pausa entre o conteudo sair e o video de encerramento comecar
        // -- protecoes e rotina
        margemVideo: 1500,      // folga alem da duracao do video antes de seguir
        carregarDados: 8000,    // limite para o dataset responder
        carregarMidia: 6000,    // limite para cada imagem / fonte
        margemGlobal: 15000,    // folga sobre a duracao total antes de encerrar a forca
        liberarSemConteudo: 100, // sem conteudo: loaded() -> finished()
        atualizarRelogio: 1000
    },

    // --- posicoes (iguais em todos os palcos) ---
    titulo: { texto: 'Destaque de hoje', y: 385.619, tam: 144.2093 },   // centralizado
    foto: { x: 102, y: 445.747, w: 876, h: 876, borda: 2, bordaCor: '#080E13' },
    hora: { x: 102, y: 1501.731, tam: 185.9686, tracking: 20 },         // tracking em 1/1000 em (Illustrator)
    descricao: { x: 102, y: 1599.428, w: 882, tam: 75, ent: 74.025, linhas: 3 },
    barra: { y: 1833.251, h: 85.758 },
    logo: { x: 20.986, y: 1852.437, w: 215.128, h: 47.387 },
    relogio: { direita: 1054.096, y: 1899.23, tam: 64.811 },

    // --- identidade por palco: CATEGORY do dataset -> fundo + cores ---
    // arte: img/destaque_{arte}.png (ja com ornamento do topo e logo do palco).
    palcos: {
        '23008': { nome: 'Palco Thunder', arte: 'thunder', fundo: '#F6002F', titulo: '#FFFFFF', hora: '#000000', texto: '#FFFFFF' },
        '23009': { nome: 'Palco Blast!', arte: 'blast', fundo: '#9D0034', titulo: '#FFFFFF', hora: '#FFA500', texto: '#FFFFFF' },
        '23005': { nome: 'Palco Universe', arte: 'universe', fundo: '#F235C3', titulo: '#FFFFFF', hora: '#3E1490', texto: '#FFFFFF' },
        '24001': { nome: 'Palco Omni', arte: 'omni', fundo: '#FF7900', titulo: '#FFFFFF', hora: '#000000', texto: '#FFFFFF' },
        '23010': { nome: 'Magic Market', arte: 'magic', fundo: '#3E1490', titulo: '#FFFFFF', hora: '#00DFF8', texto: '#FFFFFF' },
        '23007': { nome: 'Palco Omelete', arte: 'omelete', fundo: '#FFAD00', titulo: '#000000', hora: '#000000', texto: '#FFFFFF' } // id a confirmar na API
    },
    // Palco desconhecido: fundo liso (sem arte), para nao exibir o logo de outro palco.
    palcoPadrao: { nome: 'Palco', arte: '', fundo: '#1A1A1A', titulo: '#FFFFFF', hora: '#FFC800', texto: '#FFFFFF' },

    videoIntro: 'videos/destaques_intro.mp4',
    videoOutro: 'videos/destaques_outro.mp4'
};

/** Identidade visual do palco do destaque (CATEGORY); desconhecido -> palcoPadrao. */
function palcoDe(id) {
    const p = CONFIG.palcos[String(id)] || CONFIG.palcoPadrao;
    return Object.assign({ bg: p.arte ? 'img/destaque_' + p.arte + '.png' : '' }, p);
}
