/**
 * MOCK DATA - Dados de teste para desenvolvimento
 *
 * IMPORTANTE:
 * 1. Descomente <script src="js/mock-data.js"></script> no HTML para usar
 * 2. Altere enabled para false em produção
 * 3. Campos em UPPERCASE para compatibilidade com XML EdgeContents
 *
 * Amostra de D_CLIMA_HGBRASIL com codigos e descricoes confirmados no canal.
 */

var MOCK_GRUPO_ATIVO = ''; // vazio = sorteio automatico

var MOCK_CODIGOS_HGBRASIL = ['4', '4', '11'];

function criarItemMock(codigo, indice) {
    var dias = ['TERCA', 'QUARTA', 'QUINTA'];
    var datas = ['20/10', '21/10', '22/10'];
    var maximas = ['26', '27', '23'];
    var minimas = ['15', '15', '17'];
    var chuva = ['0', '0', '1'];
    var probabilidade = ['0', '0', '49'];
    var vento = ['22', '20', '17'];
    var pos = indice % 3;
    return {
        CIDADE: 'Sao Paulo',
        DIA: dias[pos],
        DATA: datas[pos],
        ATUAL: pos === 0 ? '17' : '',
        MAX: maximas[pos],
        MIN: minimas[pos],
        ICON: codigo,
        QTDE_CHUVA: chuva[pos],
        PROB_CHUVA: probabilidade[pos],
        VENTO_DIR: '',
        VENTO_VEL: vento[pos],
        UV: '',
        UVLEVEL: '',
        DESCRICAO: codigo === '4' ? 'Tempo nublado' : 'Chuvas esparsas'
    };
}

function gerarGruposCodigos(codigos) {
    var grupos = {};
    var g = 1;
    for (var i = 0; i < codigos.length; i += 3) {
        var nome = 'G' + g;
        grupos[nome] = [];
        for (var j = i; j < i + 3 && j < codigos.length; j++) {
            grupos[nome].push(criarItemMock(codigos[j], j));
        }
        g++;
    }
    return grupos;
}

var MOCK_GRUPOS = gerarGruposCodigos(MOCK_CODIGOS_HGBRASIL);

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
