/**
 * mock-data.js - Tabela Copa 2026
 *
 * Estrutura espelha os dados reais do EdgeContents:
 *   D_SPD (array) → CONFIG=0 (projeto) + CONFIG=1 (patrocinador)
 *                   Associados por SPECIALPROJECTS (mesmo ID)
 *   D_FOOTBALL_STANDINGS → campo TEXTO2 contém JSON com classificação
 *
 * Para habilitar: descomente <script src="js/mock-data.js"> no HTML
 * Para produção:  comente o <script> do mock-data no HTML
 *
 * Tempo: D_SPD[CONFIG=1].DURACAO (segundos) na intro + tabela 5s fixo; sem intro = 10s.
 * Teste fallback: remova DURACAO (video ate ended / imagem 5s).
 */
var MOCK_DATA = {
    enabled: true,
    config: {
        duration: 10000
    },

    /* --- Simula registros D_SPD (associados por SPECIALPROJECTS) --- */
    D_SPD: [
        // CONFIG=0: Dados do projeto/template
        {
            CONFIG:          '0',
            SPECIALPROJECTS: 'COPA2026_TABELA',  // ID único que associa CONFIG=0 e CONFIG=1
            TEXTO1:          'O Mundo em campo 2026',
            TEXTO2:          'Classificação - Fase de Grupos',
            TEXTO3:          '',
            TEXTO4:          '',
            TEXTO5:          ''
        },
        // CONFIG=1: Dados do patrocinador
        {
            CONFIG:          '1',
            SPECIALPROJECTS: 'COPA2026_TABELA',  // Mesmo ID para associar
            TEXT1:           'APOIO',
            IMAGE_LOGO:      'img/logo_sponsor.png',
            FILE_IMAGE1:     'img/sponsor.mp4',
            DURACAO:         '8',         // segundos da intro (omitir para fallback: video ate ended / imagem 5s)
            COLOR1:          'FBBF24',    // corDestaque (sem #, adicionado automaticamente)
            COLOR2:          '006400',    // corEscura
            COLOR3:          'FFFFFF'     // corClara
        }
    ],

    /* --- Simula registro D_FOOTBALL ---
         TEXTO2: em produção chega como string JSON; aqui é objeto JS
         master.js o usa diretamente (mock) ou via JSON.parse (produção)    --- */
    D_FOOTBALL: {
        TITULO: 'O Mundo em campo 2026',
        TEXTO2: {
            grupos: [
        {
            /* R1: México 2x1 Coreia do Sul | África do Sul 0x2 Tchéquia
               R2: México 1x1 África do Sul | Tchéquia 0x1 Coreia do Sul */
            nome: 'Grupo A',
            times: [
                { posicao: 1, nome: 'M\u00e9xico',        bandeira: 'img/flags/mx.svg', pts: '4', pj: '2', vit: '1', emp: '1', der: '0', gm: '3', gc: '2', sg: '+1' },
                { posicao: 2, nome: 'Coreia do Sul',       bandeira: 'img/flags/kr.svg', pts: '3', pj: '2', vit: '1', emp: '0', der: '1', gm: '2', gc: '2', sg: '0'  },
                { posicao: 3, nome: 'Tch\u00e9quia',       bandeira: 'img/flags/cz.svg', pts: '3', pj: '2', vit: '1', emp: '0', der: '1', gm: '2', gc: '2', sg: '0'  },
                { posicao: 4, nome: '\u00c1frica do Sul',  bandeira: 'img/flags/za.svg', pts: '1', pj: '2', vit: '0', emp: '1', der: '1', gm: '1', gc: '2', sg: '-1' }
            ],
            jogos: [
                { rodada: 1, time1: 'M\u00e9xico',       bandeira1: 'img/flags/mx.svg', time2: 'Coreia do Sul',    bandeira2: 'img/flags/kr.svg', gols1: 2, gols2: 1, data: '12/06', hora: '15:00', local: 'SoFi Stadium, Los Angeles' },
                { rodada: 1, time1: '\u00c1frica do Sul', bandeira1: 'img/flags/za.svg', time2: 'Tch\u00e9quia',    bandeira2: 'img/flags/cz.svg', gols1: 0, gols2: 2, data: '12/06', hora: '18:00', local: 'AT&T Stadium, Dallas' },
                { rodada: 2, time1: 'M\u00e9xico',       bandeira1: 'img/flags/mx.svg', time2: '\u00c1frica do Sul',bandeira2: 'img/flags/za.svg', gols1: 1, gols2: 1, data: '16/06', hora: '21:00', local: 'Estadio Azteca, Cidade do M\u00e9xico' },
                { rodada: 2, time1: 'Tch\u00e9quia',     bandeira1: 'img/flags/cz.svg', time2: 'Coreia do Sul',    bandeira2: 'img/flags/kr.svg', gols1: 0, gols2: 1, data: '17/06', hora: '15:00', local: 'MetLife Stadium, Nova York' },
                { rodada: 3, time1: 'Tch\u00e9quia',     bandeira1: 'img/flags/cz.svg', time2: 'M\u00e9xico',      bandeira2: 'img/flags/mx.svg', gols1: 1, gols2: 0, ao_vivo: true, data: '21/06', hora: '21:00', local: 'Gillette Stadium, Boston' },
                { rodada: 3, time1: 'Coreia do Sul',     bandeira1: 'img/flags/kr.svg', time2: '\u00c1frica do Sul',bandeira2: 'img/flags/za.svg', gols1: null, gols2: null, data: '21/06', hora: '21:00', local: "Levi's Stadium, San Jose" }
            ]
        },
        {
            /* R1: Canadá 3x0 Catar | Bósnia 1x2 Suíça
               R2: Canadá 2x1 Bósnia | Catar 0x1 Suíça */
            nome: 'Grupo B',
            times: [
                { posicao: 1, nome: 'Canad\u00e1',              bandeira: 'img/flags/ca.svg', pts: '6', pj: '2', vit: '2', emp: '0', der: '0', gm: '5', gc: '1', sg: '+4' },
                { posicao: 2, nome: 'Su\u00ed\u00e7a',           bandeira: 'img/flags/ch.svg', pts: '6', pj: '2', vit: '2', emp: '0', der: '0', gm: '3', gc: '1', sg: '+2' },
                { posicao: 3, nome: 'B\u00f3snia e Herzegovina', bandeira: 'img/flags/ba.svg', pts: '0', pj: '2', vit: '0', emp: '0', der: '2', gm: '2', gc: '5', sg: '-3' },
                { posicao: 4, nome: 'Catar',                     bandeira: 'img/flags/qa.svg', pts: '0', pj: '2', vit: '0', emp: '0', der: '2', gm: '0', gc: '4', sg: '-4' }
            ],
            jogos: [
                { rodada: 1, time1: 'Canad\u00e1',               bandeira1: 'img/flags/ca.svg', time2: 'Catar',                   bandeira2: 'img/flags/qa.svg', gols1: 3, gols2: 0, data: '11/06', hora: '18:00', local: 'BMO Field, Toronto' },
                { rodada: 1, time1: 'B\u00f3snia e Herzegovina',  bandeira1: 'img/flags/ba.svg', time2: 'Su\u00ed\u00e7a',         bandeira2: 'img/flags/ch.svg', gols1: 1, gols2: 2, data: '12/06', hora: '12:00', local: 'MetLife Stadium, Nova York' },
                { rodada: 2, time1: 'Canad\u00e1',               bandeira1: 'img/flags/ca.svg', time2: 'B\u00f3snia e Herzegovina',bandeira2: 'img/flags/ba.svg', gols1: 2, gols2: 1, data: '16/06', hora: '18:00', local: 'BC Place, Vancouver' },
                { rodada: 2, time1: 'Catar',                     bandeira1: 'img/flags/qa.svg', time2: 'Su\u00ed\u00e7a',         bandeira2: 'img/flags/ch.svg', gols1: 0, gols2: 1, data: '16/06', hora: '21:00', local: 'Arrowhead Stadium, Kansas City' },
                { rodada: 3, time1: 'Canad\u00e1',               bandeira1: 'img/flags/ca.svg', time2: 'Su\u00ed\u00e7a',         bandeira2: 'img/flags/ch.svg', gols1: null, gols2: null, data: '21/06', hora: '18:00', local: 'Lincoln Financial Field, Filad\u00e9lfia' },
                { rodada: 3, time1: 'B\u00f3snia e Herzegovina',  bandeira1: 'img/flags/ba.svg', time2: 'Catar',                   bandeira2: 'img/flags/qa.svg', gols1: null, gols2: null, data: '21/06', hora: '18:00', local: 'NRG Stadium, Houston' }
            ]
        },
        {
            /* R1: Brasil 4x0 Haiti | Marrocos 2x1 Escócia
               R2: Brasil 2x0 Marrocos | Haiti 0x3 Escócia */
            nome: 'Grupo C',
            times: [
                { posicao: 1, nome: 'Brasil',        bandeira: 'img/flags/br.svg',     pts: '6', pj: '2', vit: '2', emp: '0', der: '0', gm: '6', gc: '0', sg: '+6' },
                { posicao: 2, nome: 'Esc\u00f3cia',  bandeira: 'img/flags/gb-sct.svg', pts: '3', pj: '2', vit: '1', emp: '0', der: '1', gm: '4', gc: '2', sg: '+2' },
                { posicao: 3, nome: 'Marrocos',      bandeira: 'img/flags/ma.svg',     pts: '3', pj: '2', vit: '1', emp: '0', der: '1', gm: '2', gc: '2', sg: '0'  },
                { posicao: 4, nome: 'Haiti',         bandeira: 'img/flags/ht.svg',     pts: '0', pj: '2', vit: '0', emp: '0', der: '2', gm: '0', gc: '7', sg: '-7' }
            ],
            jogos: [
                { rodada: 1, time1: 'Brasil',        bandeira1: 'img/flags/br.svg',     time2: 'Haiti',        bandeira2: 'img/flags/ht.svg',     gols1: 4, gols2: 0, data: '13/06', hora: '18:00', local: 'Hard Rock Stadium, Miami' },
                { rodada: 1, time1: 'Marrocos',      bandeira1: 'img/flags/ma.svg',     time2: 'Esc\u00f3cia',  bandeira2: 'img/flags/gb-sct.svg', gols1: 2, gols2: 1, data: '13/06', hora: '21:00', local: 'Mercedes-Benz Stadium, Atlanta' },
                { rodada: 2, time1: 'Brasil',        bandeira1: 'img/flags/br.svg',     time2: 'Marrocos',     bandeira2: 'img/flags/ma.svg',     gols1: 2, gols2: 0, data: '17/06', hora: '21:00', local: 'SoFi Stadium, Los Angeles' },
                { rodada: 2, time1: 'Haiti',         bandeira1: 'img/flags/ht.svg',     time2: 'Esc\u00f3cia',  bandeira2: 'img/flags/gb-sct.svg', gols1: 0, gols2: 3, data: '18/06', hora: '15:00', local: 'Gillette Stadium, Boston' },
                { rodada: 3, time1: 'Brasil',        bandeira1: 'img/flags/br.svg',     time2: 'Esc\u00f3cia',  bandeira2: 'img/flags/gb-sct.svg', gols1: 2, gols2: 1, ao_vivo: true, data: '22/06', hora: '21:00', local: 'MetLife Stadium, Nova York' },
                { rodada: 3, time1: 'Marrocos',      bandeira1: 'img/flags/ma.svg',     time2: 'Haiti',        bandeira2: 'img/flags/ht.svg',     gols1: null, gols2: null, data: '22/06', hora: '21:00', local: 'AT&T Stadium, Dallas' }
            ]
        },
        {
            /* R1: EUA 1x0 Austrália | Paraguai 2x2 Turquia
               R2: EUA 3x1 Paraguai | Austrália 1x2 Turquia */
            nome: 'Grupo D',
            times: [
                { posicao: 1, nome: 'Estados Unidos', bandeira: 'img/flags/us.svg', pts: '6', pj: '2', vit: '2', emp: '0', der: '0', gm: '4', gc: '1', sg: '+3' },
                { posicao: 2, nome: 'Turquia',        bandeira: 'img/flags/tr.svg', pts: '4', pj: '2', vit: '1', emp: '1', der: '0', gm: '4', gc: '3', sg: '+1' },
                { posicao: 3, nome: 'Paraguai',       bandeira: 'img/flags/py.svg', pts: '1', pj: '2', vit: '0', emp: '1', der: '1', gm: '3', gc: '5', sg: '-2' },
                { posicao: 4, nome: 'Austr\u00e1lia', bandeira: 'img/flags/au.svg', pts: '0', pj: '2', vit: '0', emp: '0', der: '2', gm: '1', gc: '3', sg: '-2' }
            ],
            jogos: [
                { rodada: 1, time1: 'Estados Unidos', bandeira1: 'img/flags/us.svg', time2: 'Austr\u00e1lia', bandeira2: 'img/flags/au.svg', gols1: 1, gols2: 0, data: '13/06', hora: '15:00', local: "Levi's Stadium, San Jose" },
                { rodada: 1, time1: 'Paraguai',       bandeira1: 'img/flags/py.svg', time2: 'Turquia',       bandeira2: 'img/flags/tr.svg', gols1: 2, gols2: 2, data: '14/06', hora: '18:00', local: 'NRG Stadium, Houston' },
                { rodada: 2, time1: 'Estados Unidos', bandeira1: 'img/flags/us.svg', time2: 'Paraguai',      bandeira2: 'img/flags/py.svg', gols1: 3, gols2: 1, data: '18/06', hora: '21:00', local: 'MetLife Stadium, Nova York' },
                { rodada: 2, time1: 'Austr\u00e1lia', bandeira1: 'img/flags/au.svg', time2: 'Turquia',       bandeira2: 'img/flags/tr.svg', gols1: 1, gols2: 2, data: '18/06', hora: '18:00', local: 'Lumen Field, Seattle' },
                { rodada: 3, time1: 'Estados Unidos', bandeira1: 'img/flags/us.svg', time2: 'Turquia',       bandeira2: 'img/flags/tr.svg', gols1: null, gols2: null, data: '23/06', hora: '18:00', local: 'Arrowhead Stadium, Kansas City' },
                { rodada: 3, time1: 'Paraguai',       bandeira1: 'img/flags/py.svg', time2: 'Austr\u00e1lia',bandeira2: 'img/flags/au.svg', gols1: null, gols2: null, data: '23/06', hora: '18:00', local: 'Mercedes-Benz Stadium, Atlanta' }
            ]
        },
        {
            /* R1: Alemanha 3x1 Costa do Marfim | Curaçau 0x2 Equador
               R2: Alemanha 2x0 Curaçau | Costa do Marfim 1x1 Equador */
            nome: 'Grupo E',
            times: [
                { posicao: 1, nome: 'Alemanha',        bandeira: 'img/flags/de.svg', pts: '6', pj: '2', vit: '2', emp: '0', der: '0', gm: '5', gc: '1', sg: '+4' },
                { posicao: 2, nome: 'Equador',         bandeira: 'img/flags/ec.svg', pts: '4', pj: '2', vit: '1', emp: '1', der: '0', gm: '3', gc: '1', sg: '+2' },
                { posicao: 3, nome: 'Costa do Marfim', bandeira: 'img/flags/ci.svg', pts: '1', pj: '2', vit: '0', emp: '1', der: '1', gm: '2', gc: '4', sg: '-2' },
                { posicao: 4, nome: 'Cura\u00e7au',    bandeira: 'img/flags/cw.svg', pts: '0', pj: '2', vit: '0', emp: '0', der: '2', gm: '0', gc: '4', sg: '-4' }
            ],
            jogos: [
                { rodada: 1, time1: 'Alemanha',        bandeira1: 'img/flags/de.svg', time2: 'Costa do Marfim', bandeira2: 'img/flags/ci.svg', gols1: 3, gols2: 1, data: '14/06', hora: '21:00', local: 'AT&T Stadium, Dallas' },
                { rodada: 1, time1: 'Cura\u00e7au',    bandeira1: 'img/flags/cw.svg', time2: 'Equador',         bandeira2: 'img/flags/ec.svg', gols1: 0, gols2: 2, data: '15/06', hora: '15:00', local: 'Hard Rock Stadium, Miami' },
                { rodada: 2, time1: 'Alemanha',        bandeira1: 'img/flags/de.svg', time2: 'Cura\u00e7au',    bandeira2: 'img/flags/cw.svg', gols1: 2, gols2: 0, data: '19/06', hora: '18:00', local: 'MetLife Stadium, Nova York' },
                { rodada: 2, time1: 'Costa do Marfim', bandeira1: 'img/flags/ci.svg', time2: 'Equador',         bandeira2: 'img/flags/ec.svg', gols1: 1, gols2: 1, data: '19/06', hora: '21:00', local: 'Lincoln Financial Field, Filad\u00e9lfia' },
                { rodada: 3, time1: 'Alemanha',        bandeira1: 'img/flags/de.svg', time2: 'Equador',         bandeira2: 'img/flags/ec.svg', gols1: null, gols2: null, data: '24/06', hora: '18:00', local: 'SoFi Stadium, Los Angeles' },
                { rodada: 3, time1: 'Cura\u00e7au',    bandeira1: 'img/flags/cw.svg', time2: 'Costa do Marfim', bandeira2: 'img/flags/ci.svg', gols1: null, gols2: null, data: '24/06', hora: '18:00', local: 'NRG Stadium, Houston' }
            ]
        },
        {
            /* R1: Países Baixos 2x1 Suécia | Japão 3x0 Tunísia
               R2: Países Baixos 1x2 Japão | Suécia 2x0 Tunísia */
            nome: 'Grupo F',
            times: [
                { posicao: 1, nome: 'Jap\u00e3o',         bandeira: 'img/flags/jp.svg', pts: '6', pj: '2', vit: '2', emp: '0', der: '0', gm: '5', gc: '1', sg: '+4' },
                { posicao: 2, nome: 'Su\u00e9cia',        bandeira: 'img/flags/se.svg', pts: '3', pj: '2', vit: '1', emp: '0', der: '1', gm: '3', gc: '2', sg: '+1' },
                { posicao: 3, nome: 'Pa\u00edses Baixos', bandeira: 'img/flags/nl.svg', pts: '3', pj: '2', vit: '1', emp: '0', der: '1', gm: '3', gc: '3', sg: '0'  },
                { posicao: 4, nome: 'Tun\u00edsia',       bandeira: 'img/flags/tn.svg', pts: '0', pj: '2', vit: '0', emp: '0', der: '2', gm: '0', gc: '5', sg: '-5' }
            ],
            jogos: [
                { rodada: 1, time1: 'Pa\u00edses Baixos', bandeira1: 'img/flags/nl.svg', time2: 'Su\u00e9cia',  bandeira2: 'img/flags/se.svg', gols1: 2, gols2: 1, data: '15/06', hora: '18:00', local: 'Lumen Field, Seattle' },
                { rodada: 1, time1: 'Jap\u00e3o',         bandeira1: 'img/flags/jp.svg', time2: 'Tun\u00edsia', bandeira2: 'img/flags/tn.svg', gols1: 3, gols2: 0, data: '15/06', hora: '21:00', local: 'Mercedes-Benz Stadium, Atlanta' },
                { rodada: 2, time1: 'Pa\u00edses Baixos', bandeira1: 'img/flags/nl.svg', time2: 'Jap\u00e3o',   bandeira2: 'img/flags/jp.svg', gols1: 1, gols2: 2, data: '20/06', hora: '21:00', local: "Levi's Stadium, San Jose" },
                { rodada: 2, time1: 'Su\u00e9cia',        bandeira1: 'img/flags/se.svg', time2: 'Tun\u00edsia', bandeira2: 'img/flags/tn.svg', gols1: 2, gols2: 0, data: '20/06', hora: '18:00', local: 'Arrowhead Stadium, Kansas City' },
                { rodada: 3, time1: 'Pa\u00edses Baixos', bandeira1: 'img/flags/nl.svg', time2: 'Tun\u00edsia', bandeira2: 'img/flags/tn.svg', gols1: null, gols2: null, data: '25/06', hora: '18:00', local: 'AT&T Stadium, Dallas' },
                { rodada: 3, time1: 'Jap\u00e3o',         bandeira1: 'img/flags/jp.svg', time2: 'Su\u00e9cia',  bandeira2: 'img/flags/se.svg', gols1: null, gols2: null, data: '25/06', hora: '18:00', local: 'Hard Rock Stadium, Miami' }
            ]
        },
        {
            /* R1: Bélgica 2x0 Irã | Egito 1x1 Nova Zelândia
               R2: Bélgica 1x0 Egito | Irã 2x1 Nova Zelândia */
            nome: 'Grupo G',
            times: [
                { posicao: 1, nome: 'B\u00e9lgica',       bandeira: 'img/flags/be.svg', pts: '6', pj: '2', vit: '2', emp: '0', der: '0', gm: '3', gc: '0', sg: '+3' },
                { posicao: 2, nome: 'Ir\u00e3',           bandeira: 'img/flags/ir.svg', pts: '3', pj: '2', vit: '1', emp: '0', der: '1', gm: '2', gc: '3', sg: '-1' },
                { posicao: 3, nome: 'Nova Zel\u00e2ndia', bandeira: 'img/flags/nz.svg', pts: '1', pj: '2', vit: '0', emp: '1', der: '1', gm: '2', gc: '3', sg: '-1' },
                { posicao: 4, nome: 'Egito',              bandeira: 'img/flags/eg.svg', pts: '1', pj: '2', vit: '0', emp: '1', der: '1', gm: '1', gc: '2', sg: '-1' }
            ],
            jogos: [
                { rodada: 1, time1: 'B\u00e9lgica',        bandeira1: 'img/flags/be.svg', time2: 'Ir\u00e3',            bandeira2: 'img/flags/ir.svg', gols1: 2, gols2: 0, data: '17/06', hora: '15:00', local: 'Gillette Stadium, Boston' },
                { rodada: 1, time1: 'Egito',               bandeira1: 'img/flags/eg.svg', time2: 'Nova Zel\u00e2ndia',  bandeira2: 'img/flags/nz.svg', gols1: 1, gols2: 1, data: '17/06', hora: '18:00', local: 'BC Place, Vancouver' },
                { rodada: 2, time1: 'B\u00e9lgica',        bandeira1: 'img/flags/be.svg', time2: 'Egito',              bandeira2: 'img/flags/eg.svg', gols1: 1, gols2: 0, data: '21/06', hora: '15:00', local: 'SoFi Stadium, Los Angeles' },
                { rodada: 2, time1: 'Ir\u00e3',            bandeira1: 'img/flags/ir.svg', time2: 'Nova Zel\u00e2ndia',  bandeira2: 'img/flags/nz.svg', gols1: 2, gols2: 1, data: '22/06', hora: '12:00', local: 'Lumen Field, Seattle' },
                { rodada: 3, time1: 'B\u00e9lgica',        bandeira1: 'img/flags/be.svg', time2: 'Nova Zel\u00e2ndia',  bandeira2: 'img/flags/nz.svg', gols1: 0, gols2: 0, ao_vivo: true, data: '26/06', hora: '18:00', local: 'MetLife Stadium, Nova York' },
                { rodada: 3, time1: 'Egito',               bandeira1: 'img/flags/eg.svg', time2: 'Ir\u00e3',           bandeira2: 'img/flags/ir.svg', gols1: null, gols2: null, data: '26/06', hora: '18:00', local: 'Lincoln Financial Field, Filad\u00e9lfia' }
            ]
        },
        {
            /* R1: Espanha 3x0 Arábia Saudita | Cabo Verde 1x2 Uruguai
               R2: Espanha 2x1 Cabo Verde | Arábia Saudita 1x1 Uruguai */
            nome: 'Grupo H',
            times: [
                { posicao: 1, nome: 'Espanha',             bandeira: 'img/flags/es.svg', pts: '6', pj: '2', vit: '2', emp: '0', der: '0', gm: '5', gc: '1', sg: '+4' },
                { posicao: 2, nome: 'Uruguai',             bandeira: 'img/flags/uy.svg', pts: '4', pj: '2', vit: '1', emp: '1', der: '0', gm: '3', gc: '2', sg: '+1' },
                { posicao: 3, nome: 'Ar\u00e1bia Saudita', bandeira: 'img/flags/sa.svg', pts: '1', pj: '2', vit: '0', emp: '1', der: '1', gm: '1', gc: '4', sg: '-3' },
                { posicao: 4, nome: 'Cabo Verde',          bandeira: 'img/flags/cv.svg', pts: '0', pj: '2', vit: '0', emp: '0', der: '2', gm: '2', gc: '4', sg: '-2' }
            ],
            jogos: [
                { rodada: 1, time1: 'Espanha',             bandeira1: 'img/flags/es.svg', time2: 'Ar\u00e1bia Saudita', bandeira2: 'img/flags/sa.svg', gols1: 3, gols2: 0, data: '18/06', hora: '21:00', local: 'Hard Rock Stadium, Miami' },
                { rodada: 1, time1: 'Cabo Verde',          bandeira1: 'img/flags/cv.svg', time2: 'Uruguai',            bandeira2: 'img/flags/uy.svg', gols1: 1, gols2: 2, data: '19/06', hora: '15:00', local: 'NRG Stadium, Houston' },
                { rodada: 2, time1: 'Espanha',             bandeira1: 'img/flags/es.svg', time2: 'Cabo Verde',         bandeira2: 'img/flags/cv.svg', gols1: 2, gols2: 1, data: '23/06', hora: '21:00', local: 'AT&T Stadium, Dallas' },
                { rodada: 2, time1: 'Ar\u00e1bia Saudita', bandeira1: 'img/flags/sa.svg', time2: 'Uruguai',            bandeira2: 'img/flags/uy.svg', gols1: 1, gols2: 1, data: '23/06', hora: '18:00', local: 'Mercedes-Benz Stadium, Atlanta' },
                { rodada: 3, time1: 'Espanha',             bandeira1: 'img/flags/es.svg', time2: 'Uruguai',            bandeira2: 'img/flags/uy.svg', gols1: null, gols2: null, data: '28/06', hora: '18:00', local: 'SoFi Stadium, Los Angeles' },
                { rodada: 3, time1: 'Cabo Verde',          bandeira1: 'img/flags/cv.svg', time2: 'Ar\u00e1bia Saudita',bandeira2: 'img/flags/sa.svg', gols1: null, gols2: null, data: '28/06', hora: '18:00', local: 'Gillette Stadium, Boston' }
            ]
        },
        {
            /* R1: França 2x0 Iraque | Senegal 1x2 Noruega
               R2: França 1x1 Senegal | Iraque 0x3 Noruega */
            nome: 'Grupo I',
            times: [
                { posicao: 1, nome: 'Noruega',     bandeira: 'img/flags/no.svg', pts: '6', pj: '2', vit: '2', emp: '0', der: '0', gm: '5', gc: '1', sg: '+4' },
                { posicao: 2, nome: 'Fran\u00e7a', bandeira: 'img/flags/fr.svg', pts: '4', pj: '2', vit: '1', emp: '1', der: '0', gm: '3', gc: '1', sg: '+2' },
                { posicao: 3, nome: 'Senegal',     bandeira: 'img/flags/sn.svg', pts: '1', pj: '2', vit: '0', emp: '1', der: '1', gm: '2', gc: '3', sg: '-1' },
                { posicao: 4, nome: 'Iraque',      bandeira: 'img/flags/iq.svg', pts: '0', pj: '2', vit: '0', emp: '0', der: '2', gm: '0', gc: '5', sg: '-5' }
            ],
            jogos: [
                { rodada: 1, time1: 'Fran\u00e7a', bandeira1: 'img/flags/fr.svg', time2: 'Iraque',  bandeira2: 'img/flags/iq.svg', gols1: 2, gols2: 0, data: '19/06', hora: '21:00', local: 'MetLife Stadium, Nova York' },
                { rodada: 1, time1: 'Senegal',     bandeira1: 'img/flags/sn.svg', time2: 'Noruega', bandeira2: 'img/flags/no.svg', gols1: 1, gols2: 2, data: '20/06', hora: '15:00', local: 'Arrowhead Stadium, Kansas City' },
                { rodada: 2, time1: 'Fran\u00e7a', bandeira1: 'img/flags/fr.svg', time2: 'Senegal', bandeira2: 'img/flags/sn.svg', gols1: 1, gols2: 1, data: '24/06', hora: '21:00', local: 'AT&T Stadium, Dallas' },
                { rodada: 2, time1: 'Iraque',      bandeira1: 'img/flags/iq.svg', time2: 'Noruega', bandeira2: 'img/flags/no.svg', gols1: 0, gols2: 3, data: '25/06', hora: '15:00', local: 'Lincoln Financial Field, Filad\u00e9lfia' },
                { rodada: 3, time1: 'Fran\u00e7a', bandeira1: 'img/flags/fr.svg', time2: 'Noruega', bandeira2: 'img/flags/no.svg', gols1: 1, gols2: 1, ao_vivo: true, data: '29/06', hora: '18:00', local: 'Hard Rock Stadium, Miami' },
                { rodada: 3, time1: 'Senegal',     bandeira1: 'img/flags/sn.svg', time2: 'Iraque',  bandeira2: 'img/flags/iq.svg', gols1: null, gols2: null, data: '29/06', hora: '18:00', local: 'Lumen Field, Seattle' }
            ]
        },
        {
            /* R1: Argentina 3x0 Áustria | Argélia 2x1 Jordânia
               R2: Argentina 2x1 Argélia | Áustria 2x0 Jordânia */
            nome: 'Grupo J',
            times: [
                { posicao: 1, nome: 'Argentina',    bandeira: 'img/flags/ar.svg', pts: '6', pj: '2', vit: '2', emp: '0', der: '0', gm: '5', gc: '1', sg: '+4' },
                { posicao: 2, nome: 'Arg\u00e9lia',  bandeira: 'img/flags/dz.svg', pts: '3', pj: '2', vit: '1', emp: '0', der: '1', gm: '3', gc: '3', sg: '0'  },
                { posicao: 3, nome: '\u00c1ustria',  bandeira: 'img/flags/at.svg', pts: '3', pj: '2', vit: '1', emp: '0', der: '1', gm: '2', gc: '3', sg: '-1' },
                { posicao: 4, nome: 'Jord\u00e2nia', bandeira: 'img/flags/jo.svg', pts: '0', pj: '2', vit: '0', emp: '0', der: '2', gm: '1', gc: '4', sg: '-3' }
            ],
            jogos: [
                { rodada: 1, time1: 'Argentina',    bandeira1: 'img/flags/ar.svg', time2: '\u00c1ustria',   bandeira2: 'img/flags/at.svg', gols1: 3, gols2: 0, data: '20/06', hora: '21:00', local: 'MetLife Stadium, Nova York' },
                { rodada: 1, time1: 'Arg\u00e9lia',  bandeira1: 'img/flags/dz.svg', time2: 'Jord\u00e2nia', bandeira2: 'img/flags/jo.svg', gols1: 2, gols2: 1, data: '21/06', hora: '15:00', local: 'Hard Rock Stadium, Miami' },
                { rodada: 2, time1: 'Argentina',    bandeira1: 'img/flags/ar.svg', time2: 'Arg\u00e9lia',  bandeira2: 'img/flags/dz.svg', gols1: 2, gols2: 1, data: '25/06', hora: '21:00', local: 'SoFi Stadium, Los Angeles' },
                { rodada: 2, time1: '\u00c1ustria',  bandeira1: 'img/flags/at.svg', time2: 'Jord\u00e2nia', bandeira2: 'img/flags/jo.svg', gols1: 2, gols2: 0, data: '25/06', hora: '18:00', local: 'NRG Stadium, Houston' },
                { rodada: 3, time1: 'Argentina',    bandeira1: 'img/flags/ar.svg', time2: 'Jord\u00e2nia', bandeira2: 'img/flags/jo.svg', gols1: 1, gols2: 0, ao_vivo: true, data: '30/06', hora: '18:00', local: 'AT&T Stadium, Dallas' },
                { rodada: 3, time1: 'Arg\u00e9lia',  bandeira1: 'img/flags/dz.svg', time2: '\u00c1ustria',  bandeira2: 'img/flags/at.svg', gols1: null, gols2: null, data: '30/06', hora: '18:00', local: 'Gillette Stadium, Boston' }
            ]
        },
        {
            /* R1: Portugal 4x0 Uzbequistão | RD Congo 0x2 Colômbia
               R2: Portugal 1x1 RD Congo | Uzbequistão 2x1 Colômbia */
            nome: 'Grupo K',
            times: [
                { posicao: 1, nome: 'Portugal',         bandeira: 'img/flags/pt.svg', pts: '4', pj: '2', vit: '1', emp: '1', der: '0', gm: '5', gc: '1', sg: '+4' },
                { posicao: 2, nome: 'Col\u00f4mbia',    bandeira: 'img/flags/co.svg', pts: '3', pj: '2', vit: '1', emp: '0', der: '1', gm: '3', gc: '2', sg: '+1' },
                { posicao: 3, nome: 'Uzbequist\u00e3o', bandeira: 'img/flags/uz.svg', pts: '3', pj: '2', vit: '1', emp: '0', der: '1', gm: '2', gc: '5', sg: '-3' },
                { posicao: 4, nome: 'RD Congo',         bandeira: 'img/flags/cd.svg', pts: '1', pj: '2', vit: '0', emp: '1', der: '1', gm: '1', gc: '3', sg: '-2' }
            ],
            jogos: [
                { rodada: 1, time1: 'Portugal',          bandeira1: 'img/flags/pt.svg', time2: 'Uzbequist\u00e3o', bandeira2: 'img/flags/uz.svg', gols1: 4, gols2: 0, data: '22/06', hora: '15:00', local: 'Arrowhead Stadium, Kansas City' },
                { rodada: 1, time1: 'RD Congo',          bandeira1: 'img/flags/cd.svg', time2: 'Col\u00f4mbia',    bandeira2: 'img/flags/co.svg', gols1: 0, gols2: 2, data: '22/06', hora: '18:00', local: 'Mercedes-Benz Stadium, Atlanta' },
                { rodada: 2, time1: 'Portugal',          bandeira1: 'img/flags/pt.svg', time2: 'RD Congo',         bandeira2: 'img/flags/cd.svg', gols1: 1, gols2: 1, data: '27/06', hora: '21:00', local: 'Hard Rock Stadium, Miami' },
                { rodada: 2, time1: 'Uzbequist\u00e3o',  bandeira1: 'img/flags/uz.svg', time2: 'Col\u00f4mbia',    bandeira2: 'img/flags/co.svg', gols1: 2, gols2: 1, data: '27/06', hora: '18:00', local: 'Lincoln Financial Field, Filad\u00e9lfia' },
                { rodada: 3, time1: 'Portugal',          bandeira1: 'img/flags/pt.svg', time2: 'Col\u00f4mbia',    bandeira2: 'img/flags/co.svg', gols1: null, gols2: null, data: '02/07', hora: '18:00', local: 'SoFi Stadium, Los Angeles' },
                { rodada: 3, time1: 'RD Congo',          bandeira1: 'img/flags/cd.svg', time2: 'Uzbequist\u00e3o', bandeira2: 'img/flags/uz.svg', gols1: null, gols2: null, data: '02/07', hora: '18:00', local: 'Lumen Field, Seattle' }
            ]
        },
        {
            /* R1: Inglaterra 2x0 Gana | Croácia 1x1 Panamá
               R2: Inglaterra 1x1 Croácia | Gana 2x0 Panamá */
            nome: 'Grupo L',
            times: [
                { posicao: 1, nome: 'Inglaterra',  bandeira: 'img/flags/gb-eng.svg', pts: '4', pj: '2', vit: '1', emp: '1', der: '0', gm: '3', gc: '1', sg: '+2' },
                { posicao: 2, nome: 'Gana',        bandeira: 'img/flags/gh.svg',    pts: '3', pj: '2', vit: '1', emp: '0', der: '1', gm: '2', gc: '2', sg: '0'  },
                { posicao: 3, nome: 'Cro\u00e1cia', bandeira: 'img/flags/hr.svg',   pts: '2', pj: '2', vit: '0', emp: '2', der: '0', gm: '2', gc: '2', sg: '0'  },
                { posicao: 4, nome: 'Panam\u00e1',  bandeira: 'img/flags/pa.svg',   pts: '1', pj: '2', vit: '0', emp: '1', der: '1', gm: '1', gc: '3', sg: '-2' }
            ],
            jogos: [
                { rodada: 1, time1: 'Inglaterra',  bandeira1: 'img/flags/gb-eng.svg', time2: 'Gana',        bandeira2: 'img/flags/gh.svg', gols1: 2, gols2: 0, data: '23/06', hora: '18:00', local: 'Gillette Stadium, Boston' },
                { rodada: 1, time1: 'Cro\u00e1cia', bandeira1: 'img/flags/hr.svg',    time2: 'Panam\u00e1',  bandeira2: 'img/flags/pa.svg', gols1: 1, gols2: 1, data: '23/06', hora: '21:00', local: 'BMO Field, Toronto' },
                { rodada: 2, time1: 'Inglaterra',  bandeira1: 'img/flags/gb-eng.svg', time2: 'Cro\u00e1cia', bandeira2: 'img/flags/hr.svg', gols1: 1, gols2: 1, data: '28/06', hora: '21:00', local: 'MetLife Stadium, Nova York' },
                { rodada: 2, time1: 'Gana',        bandeira1: 'img/flags/gh.svg',    time2: 'Panam\u00e1',  bandeira2: 'img/flags/pa.svg', gols1: 2, gols2: 0, data: '28/06', hora: '18:00', local: 'BC Place, Vancouver' },
                { rodada: 3, time1: 'Inglaterra',  bandeira1: 'img/flags/gb-eng.svg', time2: 'Panam\u00e1',  bandeira2: 'img/flags/pa.svg', gols1: null, gols2: null, data: '02/07', hora: '21:00', local: 'SoFi Stadium, Los Angeles' },
                { rodada: 3, time1: 'Cro\u00e1cia', bandeira1: 'img/flags/hr.svg',    time2: 'Gana',        bandeira2: 'img/flags/gh.svg', gols1: null, gols2: null, data: '02/07', hora: '21:00', local: 'AT&T Stadium, Dallas' }
            ]
        }
            ]
        }
    }
};
