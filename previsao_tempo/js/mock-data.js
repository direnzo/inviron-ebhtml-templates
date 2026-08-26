/**
 * MOCK DATA - Dados de teste para desenvolvimento
 *
 * IMPORTANTE:
 * 1. Descomente <script src="js/mock-data.js"></script> no HTML para usar
 * 2. Altere enabled para false em produção
 * 3. Campos em UPPERCASE para compatibilidade com XML EdgeContents
 *
 * GRUPOS DE ICONES — para testar todos os 27 codigos do METEOCONS_MAP:
 *   Altere MOCK_GRUPO_ATIVO para o nome do grupo desejado (G1 a G9).
 *   Cada grupo exibe 3 icones por vez (um por card).
 *
 *   G1: 1, 1n, 2          — Sol / Noite limpa / Sol c/ poucas nuvens
 *   G2: 2r, 2n, 2rn       — Sol c/ muitas nuvens / Noite c/ nuvens
 *   G3: 3, 3n, 3tm        — Nublado
 *   G4: 4, 4r, 4n         — Sol e chuva / Noite chuvosa
 *   G5: 4rn, 4t, 4tn      — Noite nublada/chuvosa / Trovoadas
 *   G6: 5, 5n, 6          — Chuvoso / Chuva e trovoadas dia
 *   G7: 6n, 7, 7n         — Trovoadas noite / Geada
 *   G8: 8, 8n, 9          — Neve / Nevoeiro dia
 *   G9: 9n, 10, 11        — Nevoeiro noite / Chuva intensa / UV alto
 */

var MOCK_GRUPO_ATIVO = 'G1'; // <- altere aqui para trocar o grupo

var MOCK_GRUPOS = {
    G1: [
        { CIDADE: "São Paulo", DIA: "Segunda", DATA: "19/08", MAX: "32", MIN: "20", ICON: "1",  QTDE_CHUVA: "0",  PROB_CHUVA: "0",  VENTO_DIR: "NE",  VENTO_VEL: "12", UV: "10", UVLEVEL: "Muito Alto", DESCRICAO: "Sol durante todo o dia. À noite, céu limpo e temperatura amena." },
        { CIDADE: "São Paulo", DIA: "Terça",   DATA: "20/08", MAX: "29", MIN: "18", ICON: "1n", QTDE_CHUVA: "0",  PROB_CHUVA: "0",  VENTO_DIR: "N",   VENTO_VEL: "8",  UV: "0",  UVLEVEL: "Nenhum",    DESCRICAO: "Noite sem nuvens e temperatura agradável." },
        { CIDADE: "São Paulo", DIA: "Quarta",  DATA: "21/08", MAX: "30", MIN: "19", ICON: "2",  QTDE_CHUVA: "0",  PROB_CHUVA: "5",  VENTO_DIR: "ENE", VENTO_VEL: "15", UV: "7",  UVLEVEL: "Alto",       DESCRICAO: "Sol com algumas nuvens durante o dia." }
    ],
    G2: [
        { CIDADE: "Rio de Janeiro", DIA: "Segunda", DATA: "19/08", MAX: "33", MIN: "22", ICON: "2r",  QTDE_CHUVA: "0",  PROB_CHUVA: "15", VENTO_DIR: "SE",  VENTO_VEL: "20", UV: "8",  UVLEVEL: "Muito Alto", DESCRICAO: "Sol com muitas nuvens durante o dia." },
        { CIDADE: "Rio de Janeiro", DIA: "Terça",   DATA: "20/08", MAX: "28", MIN: "20", ICON: "2n",  QTDE_CHUVA: "0",  PROB_CHUVA: "5",  VENTO_DIR: "S",   VENTO_VEL: "10", UV: "0",  UVLEVEL: "Nenhum",    DESCRICAO: "Noite com algumas nuvens e ventos suaves." },
        { CIDADE: "Rio de Janeiro", DIA: "Quarta",  DATA: "21/08", MAX: "27", MIN: "19", ICON: "2rn", QTDE_CHUVA: "0",  PROB_CHUVA: "20", VENTO_DIR: "SSE", VENTO_VEL: "18", UV: "0",  UVLEVEL: "Nenhum",    DESCRICAO: "Noite com muitas nuvens. Possibilidade de nebulosidade persistente." }
    ],
    G3: [
        { CIDADE: "Curitiba", DIA: "Segunda", DATA: "19/08", MAX: "22", MIN: "14", ICON: "3",   QTDE_CHUVA: "3",  PROB_CHUVA: "40", VENTO_DIR: "SW",  VENTO_VEL: "22", UV: "2",  UVLEVEL: "Baixo",      DESCRICAO: "Nublado com chance de garoa ao longo do dia." },
        { CIDADE: "Curitiba", DIA: "Terça",   DATA: "20/08", MAX: "20", MIN: "13", ICON: "3n",  QTDE_CHUVA: "2",  PROB_CHUVA: "35", VENTO_DIR: "W",   VENTO_VEL: "18", UV: "0",  UVLEVEL: "Nenhum",    DESCRICAO: "Noite nublada com possibilidade de garoa." },
        { CIDADE: "Curitiba", DIA: "Quarta",  DATA: "21/08", MAX: "19", MIN: "12", ICON: "3tm", QTDE_CHUVA: "1",  PROB_CHUVA: "30", VENTO_DIR: "NW",  VENTO_VEL: "14", UV: "1",  UVLEVEL: "Baixo",      DESCRICAO: "Céu nublado com névoa pela manhã. Melhora gradual à tarde." }
    ],
    G4: [
        { CIDADE: "Belo Horizonte", DIA: "Segunda", DATA: "19/08", MAX: "29", MIN: "18", ICON: "4",  QTDE_CHUVA: "8",  PROB_CHUVA: "55", VENTO_DIR: "NE",  VENTO_VEL: "25", UV: "6",  UVLEVEL: "Alto",       DESCRICAO: "Períodos de sol intercalados com chuva ao longo do dia." },
        { CIDADE: "Belo Horizonte", DIA: "Terça",   DATA: "20/08", MAX: "27", MIN: "17", ICON: "4r", QTDE_CHUVA: "12", PROB_CHUVA: "70", VENTO_DIR: "N",   VENTO_VEL: "30", UV: "4",  UVLEVEL: "Moderado",   DESCRICAO: "Sol com muitas nuvens e chuva a qualquer hora." },
        { CIDADE: "Belo Horizonte", DIA: "Quarta",  DATA: "21/08", MAX: "24", MIN: "16", ICON: "4n", QTDE_CHUVA: "10", PROB_CHUVA: "65", VENTO_DIR: "NNE", VENTO_VEL: "20", UV: "0",  UVLEVEL: "Nenhum",    DESCRICAO: "Noite chuvosa com trovoadas esparsas." }
    ],
    G5: [
        { CIDADE: "Salvador", DIA: "Segunda", DATA: "19/08", MAX: "30", MIN: "22", ICON: "4rn", QTDE_CHUVA: "15", PROB_CHUVA: "75", VENTO_DIR: "SE",  VENTO_VEL: "28", UV: "0",  UVLEVEL: "Nenhum",    DESCRICAO: "Noite nublada com chuva moderada a forte." },
        { CIDADE: "Salvador", DIA: "Terça",   DATA: "20/08", MAX: "31", MIN: "21", ICON: "4t",  QTDE_CHUVA: "20", PROB_CHUVA: "80", VENTO_DIR: "E",   VENTO_VEL: "35", UV: "5",  UVLEVEL: "Moderado",   DESCRICAO: "Sol entre nuvens com pancadas de chuva e trovoadas à tarde." },
        { CIDADE: "Salvador", DIA: "Quarta",  DATA: "21/08", MAX: "28", MIN: "20", ICON: "4tn", QTDE_CHUVA: "18", PROB_CHUVA: "85", VENTO_DIR: "ESE", VENTO_VEL: "32", UV: "0",  UVLEVEL: "Nenhum",    DESCRICAO: "Noite com pancadas de chuva forte e trovoadas." }
    ],
    G6: [
        { CIDADE: "Manaus", DIA: "Segunda", DATA: "19/08", MAX: "35", MIN: "24", ICON: "5",  QTDE_CHUVA: "30", PROB_CHUVA: "90", VENTO_DIR: "NW",  VENTO_VEL: "15", UV: "3",  UVLEVEL: "Moderado",   DESCRICAO: "Chuvoso durante todo o dia com chuva constante." },
        { CIDADE: "Manaus", DIA: "Terça",   DATA: "20/08", MAX: "33", MIN: "23", ICON: "5n", QTDE_CHUVA: "25", PROB_CHUVA: "88", VENTO_DIR: "W",   VENTO_VEL: "12", UV: "0",  UVLEVEL: "Nenhum",    DESCRICAO: "Noite com chuva persistente e intensa." },
        { CIDADE: "Manaus", DIA: "Quarta",  DATA: "21/08", MAX: "32", MIN: "22", ICON: "6",  QTDE_CHUVA: "40", PROB_CHUVA: "95", VENTO_DIR: "N",   VENTO_VEL: "40", UV: "1",  UVLEVEL: "Baixo",      DESCRICAO: "Chuva forte com raios e trovoadas ao longo do dia." }
    ],
    G7: [
        { CIDADE: "Porto Alegre", DIA: "Segunda", DATA: "19/08", MAX: "18", MIN: "8",  ICON: "6n", QTDE_CHUVA: "35", PROB_CHUVA: "92", VENTO_DIR: "SW",  VENTO_VEL: "45", UV: "0",  UVLEVEL: "Nenhum",    DESCRICAO: "Noite tempestuosa com chuva forte, raios e rajadas de vento." },
        { CIDADE: "Porto Alegre", DIA: "Terça",   DATA: "20/08", MAX: "12", MIN: "2",  ICON: "7",  QTDE_CHUVA: "0",  PROB_CHUVA: "10", VENTO_DIR: "S",   VENTO_VEL: "25", UV: "1",  UVLEVEL: "Baixo",      DESCRICAO: "Geada intensa pela manhã. Temperaturas negativas nos vales." },
        { CIDADE: "Porto Alegre", DIA: "Quarta",  DATA: "21/08", MAX: "10", MIN: "0",  ICON: "7n", QTDE_CHUVA: "0",  PROB_CHUVA: "5",  VENTO_DIR: "SSW", VENTO_VEL: "20", UV: "0",  UVLEVEL: "Nenhum",    DESCRICAO: "Noite com geada severa. Sensação térmica muito abaixo de zero." }
    ],
    G8: [
        { CIDADE: "Gramado", DIA: "Segunda", DATA: "19/08", MAX: "8",  MIN: "-2", ICON: "8",  QTDE_CHUVA: "5",  PROB_CHUVA: "60", VENTO_DIR: "SW",  VENTO_VEL: "18", UV: "1",  UVLEVEL: "Baixo",      DESCRICAO: "Neve durante o dia. Acumulado previsto de até 5cm nas áreas altas." },
        { CIDADE: "Gramado", DIA: "Terça",   DATA: "20/08", MAX: "5",  MIN: "-4", ICON: "8n", QTDE_CHUVA: "3",  PROB_CHUVA: "50", VENTO_DIR: "W",   VENTO_VEL: "15", UV: "0",  UVLEVEL: "Nenhum",    DESCRICAO: "Neve à noite com acumulado moderado nas serras." },
        { CIDADE: "Gramado", DIA: "Quarta",  DATA: "21/08", MAX: "14", MIN: "6",  ICON: "9",  QTDE_CHUVA: "0",  PROB_CHUVA: "20", VENTO_DIR: "NW",  VENTO_VEL: "10", UV: "2",  UVLEVEL: "Baixo",      DESCRICAO: "Nevoeiro denso pela manhã. Melhora com sol fraco à tarde." }
    ],
    G9: [
        { CIDADE: "Florianópolis", DIA: "Segunda", DATA: "19/08", MAX: "20", MIN: "12", ICON: "9n", QTDE_CHUVA: "0",  PROB_CHUVA: "15", VENTO_DIR: "SE",  VENTO_VEL: "12", UV: "0",  UVLEVEL: "Nenhum",    DESCRICAO: "Noite com nevoeiro costeiro. Visibilidade reduzida nas estradas." },
        { CIDADE: "Florianópolis", DIA: "Terça",   DATA: "20/08", MAX: "24", MIN: "15", ICON: "10", QTDE_CHUVA: "50", PROB_CHUVA: "95", VENTO_DIR: "E",   VENTO_VEL: "50", UV: "2",  UVLEVEL: "Baixo",      DESCRICAO: "Chuva muito intensa com acumulados elevados. Risco de alagamentos." },
        { CIDADE: "Florianópolis", DIA: "Quarta",  DATA: "21/08", MAX: "36", MIN: "24", ICON: "11", QTDE_CHUVA: "0",  PROB_CHUVA: "0",  VENTO_DIR: "NE",  VENTO_VEL: "8",  UV: "11", UVLEVEL: "Extremo",    DESCRICAO: "Sol forte o dia todo. Índice UV extremo — evite exposição entre 10h e 16h." }
    ]
};

var MOCK_DATA = {
    enabled: true, // Alterar para false em producao
    config: {
        duration: 10000
    },
    dados: MOCK_GRUPOS[MOCK_GRUPO_ATIVO]
};
