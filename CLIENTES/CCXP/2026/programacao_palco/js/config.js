// =============================================================================
// CONFIG - tudo o que se ajusta no template. Para outro palco: troque so `palco`.
// Medidas em px na tela 1080x1920. Texto: y = linha de base da 1a linha, tam = fonte (px).
// Fonte: Exports/layout-programacao.json (modelo .ai, 2026-10-13).
// =============================================================================
const CONFIG = {
    debug: true, // logs [CCXP]; desligar em producao

    palco: '23008', // id do palco = campo CATEGORY do dataset

    dataset: 'D_CCXP_PALCOS',
    basePath: 'http://localhost:13199/CONTENT/DATA', // mesmo caminho de 2025 (a porta 13199 libera CORS)
    fuso: -180,   // minutos; datas sem fuso no dataset sao lidas em Sao Paulo

    // Todos os tempos em ms.
    tempos: {
        // -- quanto cada slide fica em tela (a entrada/saida de 'entrada' esta dentro desse tempo)
        intro: 3000,    // video de abertura (duracao do arquivo)
        rolando: 6000,
        daqui: 6000,
        ainda: 8000,   // "Ainda hoje"
        outro: 11000,   // video de encerramento (duracao do arquivo)
        // -- animacoes
        entrada: 1000,          // conteudo entra pela direita e sai pela esquerda
        fadeAbertura: 300,      // video de abertura some quando o conteudo entra
        fadeEncerramento: 500,  // video de encerramento entra / ornamento do topo some
        pausaEncerramento: 150, // pausa entre o conteudo sair e o video de encerramento comecar
        // -- protecoes e rotina
        margemVideo: 1500,      // folga alem da duracao do video antes de seguir
        carregarDados: 8000,    // limite para o dataset responder
        carregarMidia: 6000,    // limite para cada imagem / fonte
        margemGlobal: 15000,    // folga sobre a duracao total antes de encerrar a forca
        liberarSemConteudo: 100, // sem conteudo: loaded() -> finished()
        atualizarRelogio: 1000
    },
    maxLista: 5,

    // --- posicoes ---
    titulo: { y: 380.408, tam: 150 },                          // centralizado
    foto: { x: 74.766, y: 470.031, w: 930.234, h: 930.234 },
    hora: { x: 102, y: 1535.834, tam: 100 },
    descricao: { x: 102, y: 1611.508, w: 882, tam: 75, ent: 74, linhas: 3 },
    lista: {                                                   // "Ainda hoje"
        y: 470.031, passo: 247.277,                            // topo da 1a foto e distancia entre linhas
        foto: { x: 156.393, tam: 228.761 },
        hora: { x: 411.618, dy: 80.055, tam: 86.19 },          // dy: da foto ate a linha de base
        descricao: { x: 411.615, dy: 126.173, w: 512, tam: 37.92, ent: 43.082, linhas: 3 }
    },
    barra: { y: 1834.391, h: 85.609 },
    logo: { x: 21.33, y: 1853.565, w: 214.556, h: 47.262 },
    relogio: { direita: 1053.201, y: 1900.254, tam: 64.698 },

    // --- identidade por palco ---
    // arte: img/{arte}.png (fundo) e img/topo_{arte}.png (ornamento). slug: videos/{slug}_intro|outro.mp4
    palcos: {
        '23005': { nome: 'Palco Universe', slug: 'universe', arte: 'universe', fundo: '#f235c3', titulo: '#FFFFFF', hora: '#3f1490', texto: '#FFFFFF' },
        '23007': { nome: 'Palco Omelete', slug: 'omelete', arte: 'omelete', fundo: '#ffac00', titulo: '#000000', hora: '#FFFFFF', texto: '#000000' }, // id a confirmar na API
        '23008': { nome: 'Palco Thunder', slug: 'thunder', arte: 'thunder', fundo: '#f6002f', titulo: '#FFFFFF', hora: '#000000', texto: '#FFFFFF' },
        '23009': { nome: 'Palco Blast!', slug: 'blast', arte: 'blast', fundo: '#9d0034', titulo: '#FFFFFF', hora: '#ffa500', texto: '#FFFFFF' },
        '23010': { nome: 'Magic Market', slug: 'magic', arte: 'magic', fundo: '#3f1490', titulo: '#FFFFFF', hora: '#00dff8', texto: '#FFFFFF' },
        '24001': { nome: 'Palco Omni', slug: 'omni', arte: 'omni', fundo: '#ff7900', titulo: '#FFFFFF', hora: '#FFFFFF', texto: '#000000' },
    }
};

/** Define o palco ativo e os caminhos derivados (chamado aqui e pelo mock em ?palco=). */
function usarPalco(id) {
    const p = CONFIG.palcos[id];
    if (!p) { return false; }
    CONFIG.palco = id;
    CONFIG.p = p;
    CONFIG.bg = 'img/' + p.arte + '.png';
    CONFIG.topo = 'img/topo_' + p.arte + '.png';
    CONFIG.videoIntro = 'videos/' + p.slug + '_intro.mp4';
    CONFIG.videoOutro = 'videos/' + p.slug + '_outro.mp4';
    return true;
}
usarPalco(CONFIG.palco);
