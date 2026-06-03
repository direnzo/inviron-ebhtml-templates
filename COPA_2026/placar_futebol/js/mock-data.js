/**
 * MOCK DATA - Placar Futebol (ATUALIZADO 2026)
 * Estrutura IDÊNTICA aos dados reais do EdgeContents
 *
 * Para usar: renomeie para mock-data.js e descomente <script src="js/mock-data.js"></script> no HTML
 * Para produção: comente o <script> do mock-data no HTML
 *
 * ESTRUTURA DE DADOS (conforme MAPEAMENTO_CONSULTAS.md):
 *
 * 1. spdSponsor (D_SPD CONFIG='1'): Patrocinador
 *    - CONFIG: '1'
 *    - SPECIALPROJECT: ID do projeto (ex: "17")
 *    - TEXT1: Frase do sponsor
 *    - TEXT2: Duração do vídeo em segundos (para corte)
 *    - IMAGE_LOGO: URL do logo
 *    - FILE_IMAGE1: URL do vídeo/imagem de intro
 *    - COLOR1/2/3: Cores customizadas (hex sem #)
 *
 * 2. spdData (D_SPD CONFIG='0', TYPE='10'): Jogo atual
 *    - CONFIG: '0'
 *    - TYPE: '10'
 *    - TITLE: ID da partida (numérico) ou "STANDINGS"
 *
 * 3. footballData (D_FOOTBALL): Detalhes da partida
 *    - TITULO: ID da partida (ex: "1489371")
 *    - TEXTO2: JSON completo da API-Football
 *    - TEXTO4: Rodada (ex: "Group Stage - 1")
 *    - TEXTO5: Status (ex: "NS", "1H", "FT")
 *    - DATE: Data/hora ISO
 *    - CATEGORY: Nome da liga
 *
 * 4. teams (D_FOOTBALL_TEAMS): Dados dos times
 *    - Objeto {teamId: {TITULO, TEXTO2, TEXTO3, FOTO}}
 *    - TITULO: ID do time (ex: "6")
 *    - TEXTO2: Nome PT-BR (ex: "Brasil")
 *    - TEXTO3: Código 3 letras (ex: "BRA")
 *    - FOTO: URL PNG (fallback)
 */

/* ============================================================
   DADOS GLOBAIS - Times cadastrados (D_FOOTBALL_TEAMS)
   Simulam consultas: D_FOOTBALL_TEAMS?f_titulo=6
   ============================================================ */
var MOCK_TEAMS = {
    '6': {  // Brasil
        TITULO: '6',
        TEXTO2: 'Brasil',
        TEXTO3: 'BRA',
        FOTO: 'http://127.0.0.1:13199/FILES/127729'
    },
    '31': {  // Marrocos
        TITULO: '31',
        TEXTO2: 'Marrocos',
        TEXTO3: 'MOR',
        FOTO: 'http://127.0.0.1:13199/FILES/127760'
    },
    '26': {  // Argentina
        TITULO: '26',
        TEXTO2: 'Argentina',
        TEXTO3: 'ARG',
        FOTO: 'http://127.0.0.1:13199/FILES/127800'
    }
};

/* ============================================================
   CENÁRIOS DISPONÍVEIS
   ============================================================ */
var CENARIOS_LISTA = [
    'copa2026_grupo_br_pre',
    'copa2026_grupo_br_1h',
    'copa2026_grupo_br_ft',
    'copa2026_final_pen'
];

// Rotação aleatória (pode fixar um cenário específico)
var cenario = CENARIOS_LISTA[Math.floor(Math.random() * CENARIOS_LISTA.length)];

var CENARIOS = {

    /* ================================================================
       PRÉ-JOGO: Brasil x Marrocos (Group Stage - 1)
       MetLife Stadium | 13/06/2026 19:00
       ================================================================ */
    copa2026_grupo_br_pre: {
        enabled: true,
        config: { duration: 10000 },
        
        // D_SPD CONFIG=1 (Patrocinador)
        spdSponsor: {
            CONFIG: '1',
            SPECIALPROJECT: '17',
            TEXT1: 'APOIO',
            TEXT2: '6',  // Vídeo será cortado após 6 segundos
            IMAGE_LOGO: 'http://127.0.0.1:13199/FILES/127915',
            FILE_IMAGE1: 'file:///C:/edgeContents-SUPINVIRON/clientwork/files/f_127879.bin.mp4',
            COLOR1: 'fbff00',
            COLOR2: '006b12',
            COLOR3: 'ffffff'
        },
        
        // D_SPD CONFIG=0 TYPE=10 (Jogo atual)
        spdData: {
            CONFIG: '0',
            TYPE: '10',
            TITLE: '1489371'  // ID da partida
        },
        
        // D_FOOTBALL (Detalhes da partida)
        footballData: {
            TITULO: '1489371',
            CATEGORY: 'World Cup',
            DATE: '2026-06-13T19:00:00-03:00',
            TEXTO2: '{"response":[{"fixture":{"id":1489371,"date":"2026-06-13T19:00:00-03:00","venue":{"name":"MetLife Stadium","city":"East Rutherford"},"status":{"short":"NS","long":"Not Started","elapsed":null}},"league":{"id":1,"name":"World Cup","round":"Group Stage - 1","season":2026},"teams":{"home":{"id":6,"name":"Brazil","logo":"https://media.api-sports.io/football/teams/6.png"},"away":{"id":31,"name":"Morocco","logo":"https://media.api-sports.io/football/teams/31.png"}},"goals":{"home":null,"away":null},"score":{"halftime":{"home":null,"away":null},"fulltime":{"home":null,"away":null},"extratime":{"home":null,"away":null},"penalty":{"home":null,"away":null}}}]}',
            TEXTO4: 'Group Stage - 1',
            TEXTO5: 'NS'
        },
        
        // D_FOOTBALL_TEAMS (Dados dos times)
        teams: MOCK_TEAMS
    },

    /* ================================================================
       1º TEMPO: Brasil x Marrocos (23 min, 1-0)
       MetLife Stadium | Em andamento
       ================================================================ */
    copa2026_grupo_br_1h: {
        enabled: true,
        config: { duration: 10000 },
        
        spdSponsor: {
            CONFIG: '1',
            SPECIALPROJECT: '17',
            TEXT1: 'APOIO',
            TEXT2: '6',
            IMAGE_LOGO: 'http://127.0.0.1:13199/FILES/127915',
            FILE_IMAGE1: 'file:///C:/edgeContents-SUPINVIRON/clientwork/files/f_127879.bin.mp4',
            COLOR1: 'fbff00',
            COLOR2: '006b12',
            COLOR3: 'ffffff'
        },
        
        spdData: {
            CONFIG: '0',
            TYPE: '10',
            TITLE: '1489371'
        },
        
        footballData: {
            TITULO: '1489371',
            CATEGORY: 'World Cup',
            DATE: '2026-06-13T19:00:00-03:00',
            TEXTO2: '{"response":[{"fixture":{"id":1489371,"date":"2026-06-13T19:00:00-03:00","venue":{"name":"MetLife Stadium","city":"East Rutherford"},"status":{"short":"1H","long":"First Half","elapsed":23}},"league":{"id":1,"name":"World Cup","round":"Group Stage - 1","season":2026},"teams":{"home":{"id":6,"name":"Brazil","logo":"https://media.api-sports.io/football/teams/6.png"},"away":{"id":31,"name":"Morocco","logo":"https://media.api-sports.io/football/teams/31.png"}},"goals":{"home":1,"away":0},"score":{"halftime":{"home":null,"away":null},"fulltime":{"home":null,"away":null},"extratime":{"home":null,"away":null},"penalty":{"home":null,"away":null}}}]}',
            TEXTO4: 'Group Stage - 1',
            TEXTO5: '1H'
        },
        
        teams: MOCK_TEAMS
    },

    /* ================================================================
       ENCERRADO: Brasil x Marrocos (FT, 3-0)
       MetLife Stadium | Resultado final
       ================================================================ */
    copa2026_grupo_br_ft: {
        enabled: true,
        config: { duration: 10000 },
        
        spdSponsor: {
            CONFIG: '1',
            SPECIALPROJECT: '17',
            TEXT1: 'APOIO',
            TEXT2: '6',
            IMAGE_LOGO: 'http://127.0.0.1:13199/FILES/127915',
            FILE_IMAGE1: 'file:///C:/edgeContents-SUPINVIRON/clientwork/files/f_127879.bin.mp4',
            COLOR1: 'fbff00',
            COLOR2: '006b12',
            COLOR3: 'ffffff'
        },
        
        spdData: {
            CONFIG: '0',
            TYPE: '10',
            TITLE: '1489371'
        },
        
        footballData: {
            TITULO: '1489371',
            CATEGORY: 'World Cup',
            DATE: '2026-06-13T19:00:00-03:00',
            TEXTO2: '{"response":[{"fixture":{"id":1489371,"date":"2026-06-13T19:00:00-03:00","venue":{"name":"MetLife Stadium","city":"East Rutherford"},"status":{"short":"FT","long":"Match Finished","elapsed":90}},"league":{"id":1,"name":"World Cup","round":"Group Stage - 1","season":2026},"teams":{"home":{"id":6,"name":"Brazil","logo":"https://media.api-sports.io/football/teams/6.png"},"away":{"id":31,"name":"Morocco","logo":"https://media.api-sports.io/football/teams/31.png"}},"goals":{"home":3,"away":0},"score":{"halftime":{"home":2,"away":0},"fulltime":{"home":3,"away":0},"extratime":{"home":null,"away":null},"penalty":{"home":null,"away":null}}}]}',
            TEXTO4: 'Group Stage - 1',
            TEXTO5: 'FT'
        },
        
        teams: MOCK_TEAMS
    },

    /* ================================================================
       FINAL - PÊNALTIS: Brasil x Argentina (2-2, pen 4-2)
       MetLife Stadium | Final da Copa
       ================================================================ */
    copa2026_final_pen: {
        enabled: true,
        config: { duration: 10000 },
        
        spdSponsor: {
            CONFIG: '1',
            SPECIALPROJECT: '17',
            TEXT1: 'APOIO',
            TEXT2: '',  // Vídeo sem corte (roda até o fim)
            IMAGE_LOGO: 'http://127.0.0.1:13199/FILES/127915',
            FILE_IMAGE1: 'file:///C:/edgeContents-SUPINVIRON/clientwork/files/f_127879.bin.mp4',
            COLOR1: 'fbff00',
            COLOR2: '006b12',
            COLOR3: 'ffffff'
        },
        
        spdData: {
            CONFIG: '0',
            TYPE: '10',
            TITLE: '1489372'
        },
        
        footballData: {
            TITULO: '1489372',
            CATEGORY: 'World Cup',
            DATE: '2026-07-19T15:00:00-03:00',
            TEXTO2: '{"response":[{"fixture":{"id":1489372,"date":"2026-07-19T15:00:00-03:00","venue":{"name":"MetLife Stadium","city":"East Rutherford"},"status":{"short":"FT","long":"Match Finished","elapsed":120}},"league":{"id":1,"name":"World Cup","round":"Final","season":2026},"teams":{"home":{"id":6,"name":"Brazil","logo":"https://media.api-sports.io/football/teams/6.png"},"away":{"id":26,"name":"Argentina","logo":"https://media.api-sports.io/football/teams/26.png"}},"goals":{"home":2,"away":2},"score":{"halftime":{"home":1,"away":1},"fulltime":{"home":2,"away":2},"extratime":{"home":2,"away":2},"penalty":{"home":4,"away":2}}}]}',
            TEXTO4: 'Final',
            TEXTO5: 'FT'
        },
        
        teams: MOCK_TEAMS
    }

};

/* ============================================================
   MOCK_DATA - Estrutura final usada pelo template
   ============================================================ */
var MOCK_DATA = CENARIOS[cenario];
MOCK_DATA.dados = MOCK_DATA; // Compatibilidade com código antigo
