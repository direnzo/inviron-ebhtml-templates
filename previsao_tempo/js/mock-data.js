/**
 * MOCK DATA - Dados de teste para desenvolvimento
 *
 * IMPORTANTE:
 * 1. Descomente <script src="js/mock-data.js"></script> no HTML para usar
 * 2. Altere enabled para false em produção
 * 3. Campos em UPPERCASE para compatibilidade com XML EdgeContents
 *
 * GRUPOS DE ICONES CPTEC — teste de todas as siglas do canal no campo ICON.
 *   Cada grupo exibe 3 siglas por vez.
 *   A quantidade de grupos e gerada automaticamente a partir da lista abaixo.
 */

var MOCK_GRUPO_ATIVO = ''; // vazio = sorteio automatico

var MOCK_SIGLAS_CPTEC = [
    'ec', 'ci', 'c', 'in', 'pp', 'cm', 'cn', 'pt', 'pm', 'np', 'pc', 'pn',
    'cv', 'ch', 't', 'ps', 'e', 'n', 'cl', 'nv', 'g', 'ne', 'nd', 'pnt',
    'psc', 'pcm', 'pct', 'pcn', 'npt', 'npn', 'ncn', 'nct', 'ncm', 'npm',
    'npp', 'vn', 'ct', 'ppn', 'ppt', 'ppm'
];

function criarItemMock(sigla, indice) {
    var dias = ['Segunda', 'Terca', 'Quarta'];
    var datas = ['19/08', '20/08', '21/08'];
    var pos = indice % 3;
    return {
        CIDADE: 'São Paulo',
        DIA: dias[pos],
        DATA: datas[pos],
        MAX: String(30 - pos),
        MIN: String(20 - pos),
        ICON: sigla,
        QTDE_CHUVA: String(pos),
        PROB_CHUVA: String((pos + 1) * 10),
        VENTO_DIR: 'NE',
        VENTO_VEL: '12',
        UV: '7',
        UVLEVEL: 'Alto',
        DESCRICAO: ''
    };
}

function gerarGruposSiglas(siglas) {
    var grupos = {};
    var g = 1;
    for (var i = 0; i < siglas.length; i += 3) {
        var nome = 'G' + g;
        grupos[nome] = [];
        for (var j = i; j < i + 3 && j < siglas.length; j++) {
            grupos[nome].push(criarItemMock(siglas[j], j));
        }
        g++;
    }
    return grupos;
}

var MOCK_GRUPOS = gerarGruposSiglas(MOCK_SIGLAS_CPTEC);

function escolherGrupoAleatorio(grupos) {
    var nomes = [];
    for (var k in grupos) {
        if (grupos.hasOwnProperty(k)) {
            nomes.push(k);
        }
    }
    if (!nomes.length) return '';
    return nomes[Math.floor(Math.random() * nomes.length)];
}

if (!MOCK_GRUPO_ATIVO || !MOCK_GRUPOS[MOCK_GRUPO_ATIVO]) {
    MOCK_GRUPO_ATIVO = escolherGrupoAleatorio(MOCK_GRUPOS);
}

var MOCK_DATA = {
    enabled: true, // Alterar para false em producao
    config: {
        duration: 10000
    },
    dados: MOCK_GRUPOS[MOCK_GRUPO_ATIVO]
};
