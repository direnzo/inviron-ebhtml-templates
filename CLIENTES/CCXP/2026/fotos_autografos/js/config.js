// =============================================================================
// CONFIG - tudo o que se ajusta no template Fotos e Autografos (painel LED 1280x512).
// Medidas em px na tela 1280x512. Texto: baseline = linha de base, tam = fonte (px).
// Fonte: Materiais/03_Template-F&A/Exports/layout-fotos-autografos.json (modelo .ai, 2026-10-13).
// Valores marcados "provisorio" aguardam resposta do plano (docs/PLANO-FOTOS-AUTOGRAFOS.md, sec. 8).
// =============================================================================
const CONFIG = {
    debug: true, // logs [CCXP]; desligar em producao

    dataset: 'D_CCXP_FEA',
    basePath: 'http://localhost:13199/CONTENT/DATA', // mesmo caminho de 2025 (a porta 13199 libera CORS)
    fuso: -180,   // minutos; datas sem fuso no dataset sao lidas em Sao Paulo

    // Campos do dataset (2025: TITULO artista, FOTO, CATEGORY modalidade, DT_BEGIN/DT_END, TEXTO3 esgotado).
    campos: {
        artista: 'TITULO', foto: 'FOTO', modalidade: 'CATEGORY', inicio: 'DT_BEGIN', fim: 'DT_END',
        esgotado: 'TEXTO3'
    },
    esgotadoValor: 'sim',      // provisorio (pergunta 6): TEXTO3 === 'sim', sem caixa/espacos
    itensPorPagina: 2,         // blocos de artista por tela
    maxModalidades: 5,         // linhas por artista; o excedente e ignorado (provisorio)
    limiteGrande: 3,           // ate N modalidades: bloco grande; acima: compacto (provisorio, pergunta 1)
    duracaoPadraoMin: 60,      // sessao sem DT_END valido

    // Todos os tempos em ms.
    tempos: {
        intro: 5000,           // F&A INTRO.mp4 (duracao do arquivo)
        pagina: 10000,         // cada pagina (2025; provisorio, pergunta 5)
        outro: 11000,          // F&A ENCERRAMENTO.mp4 (duracao do arquivo)
        // -- animacao em camadas, como 2025: o conteudo entra pela direita e sai pela esquerda
        entrada: 800,          // deslize de cada bloco
        escalonar: 200,        // atraso entre o bloco esquerdo e o direito na entrada
        escalonarSaida: 100,   // idem na saida
        fadeAbertura: 300,     // video de abertura some quando a 1a pagina entra
        fadeEncerramento: 500, // video de encerramento entra
        pausaEncerramento: 150,// pausa entre o conteudo sair e o video de encerramento comecar
        // -- protecoes e rotina
        margemVideo: 1500,     // folga alem da duracao do video antes de seguir
        carregarDados: 8000,   // limite para o dataset responder
        carregarMidia: 6000,   // limite para cada imagem / fonte
        margemGlobal: 15000,   // folga sobre a duracao total antes de encerrar a forca
        liberarSemConteudo: 100// sem conteudo: loaded() -> finished()
    },

    fundo: 'img/fundo_FA.png',
    fundoX: -1,  // PNG 1281x513 (prancheta fracionaria): coluna 0 com alfa 25% e linha 0 com 50%; desloca -1
    fundoY: -1,
    videoIntro: 'videos/fa_intro.mp4',
    videoOutro: 'videos/fa_outro.mp4',

    // --- layout (px em 1280x512) ---
    // Bloco direito = esquerdo + deslocamento (titulo, foto e lista; ver layout JSON).
    deslocamentoBloco: 615.953,
    titulo: { x: 70.12, baselines: [83.334, 121.423], tam: 43.5303, linhas: 2, largura: 540, cor: '#ADDA09' },
    foto: { x: 70.997, y: 132.982, lado: 307.33, borda: 1, bordaCor: '#000000' },
    // Lista de modalidades: rotulo (ciano) e horario (branco) logo abaixo; x relativo ao bloco esquerdo.
    // baselines = linha de base do rotulo de cada item; horario = rotulo + horarioDelta.
    variantes: {
        compacta: {
            xRotulo: 391.296, xHorario: 390.226,
            tamRotulo: 25.0196, tamHorario: 30.0235, horarioDelta: 28.783,
            baselines: [164.293, 221.556, 278.82, 337.556, 394.82]
        },
        grande: {
            xRotulo: 391.879, xHorario: 390.226, // bloco direito medido em 1007.832 / 1006.179, menos o deslocamento
            tamRotulo: 38.607, tamHorario: 46.3284, horarioDelta: 44.416,
            baselines: [186.681, 275.043, 363.406]
        }
    },
    corRotulo: '#00DFF8',
    corHorario: '#FFFFFF',
    // Selo "esgotado" (placeholder: o arquivo de arte nao veio). Centro medido na variante compacta,
    // relativo ao x e a linha de base do horario; escala com o tamanho do horario (pergunta 8).
    selo: { w: 102.678, h: 20.981, dx: 63.636, dy: -9.699, rotacao: -7.84, cor: '#F60000', texto: 'esgotado', textoCor: '#FFFFFF' },

    // Rotulo exibido por modalidade (CATEGORY sem acento/caixa/espacos extras). Desconhecida: usa o
    // proprio texto do CATEGORY, nunca descarta. Provisorio (perguntas 2 e 7).
    modalidades: {
        'autografo': 'Autógrafo', 'autografos': 'Autógrafo',
        'foto individual': 'Foto individual', 'foto em dupla': 'Foto em dupla', 'foto em grupo': 'Foto em grupo',
        'fotos': 'Foto individual', 'selfie': 'Selfie',
        'meet&greet': 'Meet&Greet', 'meet & greet': 'Meet&Greet', 'meet and greet': 'Meet&Greet'
    }
};
