/**
 * MOCK DATA - tempo_momento
 *
 * Simula os campos da leitura atual em D_CLIMA_HGBRASIL
 * Campos em UPPERCASE seguindo padrao XML EdgeContents
 *
 * IMPORTANTE: Alterar enabled para false em producao
 */

var MOCK_DATA = {
    enabled: true,
    dados: []
};

// Use um codigo HG Brasil (1 a 11) para fixar um icone, ou null para sequencial.
var MOCK_ICONE_ATIVO = null;

var MOCK_CONDICOES = [
    { icon: "1", descricao: "Sol" },
    { icon: "2", descricao: "Chuva" },
    { icon: "3", descricao: "Trovoadas" },
    { icon: "4", descricao: "Tempo nublado" },
    { icon: "5", descricao: "Sol e chuva" },
    { icon: "6", descricao: "Sol e nuvens" },
    { icon: "7", descricao: "Neve" },
    { icon: "8", descricao: "Chuva forte" },
    { icon: "9", descricao: "Geada" },
    { icon: "10", descricao: "Chuvisco" },
    { icon: "11", descricao: "Chuvas esparsas" }
];

function mockAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
    
}

var PERFIL_PADRAO = {
    tempAtualMin: 18,
    tempAtualMax: 28,
    quedaMin: 1,
    quedaMax: 4,
    subidaMin: 1,
    subidaMax: 4,
    sensacaoDeltaMin: -1,
    sensacaoDeltaMax: 2,
    umidadeMin: 45,
    umidadeMax: 75,
    ventoMin: 6,
    ventoMax: 20,
    rajadaExtraMin: 3,
    rajadaExtraMax: 10,
    direcoes: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
};

var MOCK_PERFIS_ICONE = {
    "1": {
        tempAtualMin: 29, tempAtualMax: 37,
        umidadeMin: 22, umidadeMax: 45,
        ventoMin: 7, ventoMax: 22,
        sensacaoDeltaMin: 1, sensacaoDeltaMax: 4,
        direcoes: ["N", "NE", "E", "ENE"]
    },
    "1n": {
        tempAtualMin: 16, tempAtualMax: 24,
        umidadeMin: 45, umidadeMax: 68,
        ventoMin: 4, ventoMax: 14,
        sensacaoDeltaMin: -2, sensacaoDeltaMax: 1,
        direcoes: ["N", "NE", "E", "NW"]
    },
    "2": {
        tempAtualMin: 24, tempAtualMax: 32,
        umidadeMin: 35, umidadeMax: 58,
        ventoMin: 6, ventoMax: 20,
        sensacaoDeltaMin: 0, sensacaoDeltaMax: 3,
        direcoes: ["N", "NE", "E", "SE"]
    },
    "2r": {
        tempAtualMin: 22, tempAtualMax: 29,
        umidadeMin: 60, umidadeMax: 86,
        ventoMin: 9, ventoMax: 26,
        sensacaoDeltaMin: -2, sensacaoDeltaMax: 1,
        direcoes: ["E", "SE", "S", "SW"]
    },
    "2n": {
        tempAtualMin: 17, tempAtualMax: 24,
        umidadeMin: 52, umidadeMax: 74,
        ventoMin: 5, ventoMax: 15,
        sensacaoDeltaMin: -2, sensacaoDeltaMax: 1,
        direcoes: ["N", "NE", "E", "SE"]
    },
    "2rn": {
        tempAtualMin: 16, tempAtualMax: 23,
        umidadeMin: 65, umidadeMax: 92,
        ventoMin: 8, ventoMax: 24,
        sensacaoDeltaMin: -3, sensacaoDeltaMax: 0,
        direcoes: ["E", "SE", "S", "SW"]
    },
    "3": {
        tempAtualMin: 20, tempAtualMax: 28,
        umidadeMin: 52, umidadeMax: 78,
        ventoMin: 6, ventoMax: 18,
        sensacaoDeltaMin: -1, sensacaoDeltaMax: 1,
        direcoes: ["S", "SW", "W", "NW"]
    },
    "3n": {
        tempAtualMin: 15, tempAtualMax: 22,
        umidadeMin: 60, umidadeMax: 84,
        ventoMin: 5, ventoMax: 16,
        sensacaoDeltaMin: -2, sensacaoDeltaMax: 0,
        direcoes: ["S", "SW", "W", "NW"]
    },
    "4": {
        tempAtualMin: 21, tempAtualMax: 29,
        umidadeMin: 68, umidadeMax: 92,
        ventoMin: 10, ventoMax: 28,
        sensacaoDeltaMin: -2, sensacaoDeltaMax: 1,
        direcoes: ["E", "SE", "S", "SW"]
    },
    "4r": {
        tempAtualMin: 19, tempAtualMax: 26,
        umidadeMin: 78, umidadeMax: 98,
        ventoMin: 14, ventoMax: 35,
        sensacaoDeltaMin: -3, sensacaoDeltaMax: 0,
        direcoes: ["SE", "S", "SW", "W"]
    },
    "4n": {
        tempAtualMin: 17, tempAtualMax: 24,
        umidadeMin: 80, umidadeMax: 98,
        ventoMin: 11, ventoMax: 30,
        sensacaoDeltaMin: -3, sensacaoDeltaMax: 0,
        direcoes: ["E", "SE", "S", "SW"]
    },
    "4rn": {
        tempAtualMin: 16, tempAtualMax: 22,
        umidadeMin: 84, umidadeMax: 99,
        ventoMin: 14, ventoMax: 36,
        sensacaoDeltaMin: -4, sensacaoDeltaMax: -1,
        direcoes: ["SE", "S", "SW", "W"]
    },
    "4t": {
        tempAtualMin: 20, tempAtualMax: 28,
        umidadeMin: 74, umidadeMax: 97,
        ventoMin: 18, ventoMax: 42,
        rajadaExtraMin: 8, rajadaExtraMax: 22,
        sensacaoDeltaMin: -3, sensacaoDeltaMax: 0,
        direcoes: ["SE", "S", "SW", "W", "NW"]
    },
    "4tn": {
        tempAtualMin: 18, tempAtualMax: 24,
        umidadeMin: 80, umidadeMax: 99,
        ventoMin: 20, ventoMax: 45,
        rajadaExtraMin: 10, rajadaExtraMax: 24,
        sensacaoDeltaMin: -4, sensacaoDeltaMax: -1,
        direcoes: ["SE", "S", "SW", "W", "NW"]
    },
    "5": {
        tempAtualMin: 18, tempAtualMax: 25,
        umidadeMin: 82, umidadeMax: 99,
        ventoMin: 12, ventoMax: 32,
        sensacaoDeltaMin: -3, sensacaoDeltaMax: 0,
        direcoes: ["S", "SW", "W", "NW"]
    },
    "5n": {
        tempAtualMin: 15, tempAtualMax: 22,
        umidadeMin: 86, umidadeMax: 99,
        ventoMin: 11, ventoMax: 30,
        sensacaoDeltaMin: -4, sensacaoDeltaMax: -1,
        direcoes: ["S", "SW", "W", "NW"]
    },
    "6": {
        tempAtualMin: 19, tempAtualMax: 26,
        umidadeMin: 80, umidadeMax: 99,
        ventoMin: 20, ventoMax: 48,
        rajadaExtraMin: 10, rajadaExtraMax: 26,
        sensacaoDeltaMin: -3, sensacaoDeltaMax: 0,
        direcoes: ["SE", "S", "SW", "W", "NW"]
    },
    "6n": {
        tempAtualMin: 16, tempAtualMax: 23,
        umidadeMin: 84, umidadeMax: 99,
        ventoMin: 22, ventoMax: 50,
        rajadaExtraMin: 12, rajadaExtraMax: 28,
        sensacaoDeltaMin: -4, sensacaoDeltaMax: -1,
        direcoes: ["SE", "S", "SW", "W", "NW"]
    },
    "7": {
        tempAtualMin: 0, tempAtualMax: 9,
        umidadeMin: 65, umidadeMax: 90,
        ventoMin: 5, ventoMax: 17,
        sensacaoDeltaMin: -5, sensacaoDeltaMax: -1,
        direcoes: ["S", "SW", "W"]
    },
    "7n": {
        tempAtualMin: -2, tempAtualMax: 6,
        umidadeMin: 70, umidadeMax: 94,
        ventoMin: 4, ventoMax: 14,
        sensacaoDeltaMin: -6, sensacaoDeltaMax: -2,
        direcoes: ["S", "SW", "W"]
    },
    "8": {
        tempAtualMin: -5, tempAtualMax: 4,
        umidadeMin: 72, umidadeMax: 96,
        ventoMin: 8, ventoMax: 20,
        sensacaoDeltaMin: -7, sensacaoDeltaMax: -2,
        direcoes: ["S", "SW", "W", "NW"]
    },
    "9": {
        tempAtualMin: 10, tempAtualMax: 19,
        umidadeMin: 88, umidadeMax: 99,
        ventoMin: 2, ventoMax: 10,
        sensacaoDeltaMin: -2, sensacaoDeltaMax: 0,
        direcoes: ["N", "NE", "E", "NW"]
    },
    "9n": {
        tempAtualMin: 8, tempAtualMax: 17,
        umidadeMin: 90, umidadeMax: 99,
        ventoMin: 1, ventoMax: 8,
        sensacaoDeltaMin: -3, sensacaoDeltaMax: 0,
        direcoes: ["N", "NE", "E", "NW"]
    },
    "3tm": {
        tempAtualMin: 16, tempAtualMax: 24,
        umidadeMin: 70, umidadeMax: 92,
        ventoMin: 4, ventoMax: 16,
        sensacaoDeltaMin: -2, sensacaoDeltaMax: 1,
        direcoes: ["S", "SW", "W", "NW"]
    },
    "8n": {
        tempAtualMin: -6, tempAtualMax: 3,
        umidadeMin: 75, umidadeMax: 97,
        ventoMin: 6, ventoMax: 18,
        sensacaoDeltaMin: -8, sensacaoDeltaMax: -3,
        direcoes: ["S", "SW", "W", "NW"]
    },
    "10": {
        tempAtualMin: 18, tempAtualMax: 26,
        umidadeMin: 88, umidadeMax: 99,
        ventoMin: 18, ventoMax: 50,
        rajadaExtraMin: 12, rajadaExtraMax: 30,
        sensacaoDeltaMin: -3, sensacaoDeltaMax: 0,
        direcoes: ["SE", "S", "SW", "W", "NW"]
    },
    "11": {
        tempAtualMin: 20, tempAtualMax: 30,
        umidadeMin: 72, umidadeMax: 95,
        ventoMin: 8, ventoMax: 22,
        sensacaoDeltaMin: -2, sensacaoDeltaMax: 1,
        direcoes: ["S", "SW", "W", "NW"]
    }
};

function obterPerfilPorIcone(icon) {
    var iconKey = String(icon || "");
    var perfilIcone = MOCK_PERFIS_ICONE[iconKey] || {};
    var perfilFinal = {};
    var chave;

    for (chave in PERFIL_PADRAO) {
        if (PERFIL_PADRAO.hasOwnProperty(chave)) {
            perfilFinal[chave] = PERFIL_PADRAO[chave];
        }
    }

    for (chave in perfilIcone) {
        if (perfilIcone.hasOwnProperty(chave)) {
            perfilFinal[chave] = perfilIcone[chave];
        }
    }

    return perfilFinal;
}

function escolherCondicaoAleatoria() {
    if (MOCK_ICONE_ATIVO !== null && MOCK_ICONE_ATIVO !== undefined && MOCK_ICONE_ATIVO !== '') {
        var i;
        for (i = 0; i < MOCK_CONDICOES.length; i++) {
            if (MOCK_CONDICOES[i].icon === String(MOCK_ICONE_ATIVO)) {
                return MOCK_CONDICOES[i];
            }
        }
    }
    // Sequencial: avanca um icone a cada reload, percorrendo todos em ordem
    var chaveLS = 'mock_icone_seq';
    var indiceAtual = 0;
    try {
        indiceAtual = parseInt(localStorage.getItem(chaveLS) || '0', 10);
        if (isNaN(indiceAtual) || indiceAtual < 0 || indiceAtual >= MOCK_CONDICOES.length) {
            indiceAtual = 0;
        }
    } catch (e) { indiceAtual = 0; }
    var proximo = (indiceAtual + 1) % MOCK_CONDICOES.length;
    try { localStorage.setItem(chaveLS, String(proximo)); } catch (e) {}
    return MOCK_CONDICOES[indiceAtual];
}

function criarItemMock(condicao) {
    var perfil = obterPerfilPorIcone(condicao.icon);
    var tempAtual = mockAleatorio(perfil.tempAtualMin, perfil.tempAtualMax);
    var tempMin = tempAtual - mockAleatorio(perfil.quedaMin, perfil.quedaMax);
    var tempMax = tempAtual + mockAleatorio(perfil.subidaMin, perfil.subidaMax);
    var ventoVel = mockAleatorio(perfil.ventoMin, perfil.ventoMax);
    var ventoMax = ventoVel + mockAleatorio(perfil.rajadaExtraMin, perfil.rajadaExtraMax);
    var ventoMin = Math.max(0, ventoVel - mockAleatorio(1, 7));
    var dirs = perfil.direcoes;
    var dir = dirs[Math.floor(Math.random() * dirs.length)];

    return {
        CIDADE: "São Paulo",
        CIDADE_SYS: "sao-paulo:sp:br",
        ICON: condicao.icon,
        TEMP_ATUAL: String(tempAtual),
        TEMP_MAX: String(tempMax),
        TEMP_MIN: String(tempMin),
        DESCRICAO: condicao.descricao,
        UMIDADE: String(mockAleatorio(perfil.umidadeMin, perfil.umidadeMax)),
        VENTO_DIR: dir,
        VENTO_VEL: String(ventoVel),
        VENTO_MAX: String(ventoMax),
        VENTO_MIN: String(ventoMin),
        SENSACAO: ""
    };
}

MOCK_DATA.dados = [criarItemMock(escolherCondicaoAleatoria())];

MOCK_DATA.sponsor = {
    text1: 'Apoio:',
    imageLogo: 'img/logo_sponsor.png',
    mediaCandidates: ['img/sponsor.mp4', 'img/logo_sponsor.png'],
    timeoutMs: 5000
};
