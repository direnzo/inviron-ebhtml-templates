/**
 * Mock Data - PRECO PRISMATURISMO
 * Altere MOCK_DATA.enabled = false em producao.
 *
 * D_COMBUSTIVEL (array):
 *   O PRIMEIRO item do array e o combustivel ativo no mock.
 *   Reordene para testar variantes diferentes.
 *   TITULO  : tipo do combustivel (deve bater com CORES_COMBUSTIVEL em master.js)
 *   PRECO   : usa ponto decimal, ex: '4.39' | '6.49'
 *
 * D_LOGO (array - suporte a datalist):
 *   FOTO1   : URL da bandeira (distribuidora)
 *   FOTO2   : URL do logo do posto
 */

var MOCK_DATA = {
    enabled: true,  /* Alterar para false em producao */

    datasets: {

        /*
         * D_COMBUSTIVEL: reordene para ativar a variante desejada.
         * O primeiro item do array e o que sera exibido no template.
         */
        'D_COMBUSTIVEL': [
            { 'TITULO': 'Etanol Comum',       'PRECO': '4.39', 'DESCRICAO': 'EC'  },
            /* --- outras variantes --- */
            { 'TITULO': 'Gasolina',            'PRECO': '6.29', 'DESCRICAO': 'G'   },
            { 'TITULO': 'Gasolina Aditivada',  'PRECO': '6.69', 'DESCRICAO': 'GA'  },
            { 'TITULO': 'Gasolina Premium',    'PRECO': '7.19', 'DESCRICAO': 'GP'  },
            { 'TITULO': 'Diesel S10',          'PRECO': '5.89', 'DESCRICAO': 'DS'  },
            { 'TITULO': 'Diesel Aditivado',    'PRECO': '6.19', 'DESCRICAO': 'DA'  },
            { 'TITULO': 'GNV',                 'PRECO': '3.79', 'DESCRICAO': 'GNV' }
        ],

        /*
         * D_LOGO como array para suportar datalist no mock.
         * Troque FOTO1/FOTO2 para testar bandeiras:
         *   bandeira-petrobras.png | bandeira-ipiranga.png | bandeira-SHELL.png
         *   logo-posto.png | logo-ale.png | '' (vazio = oculto)
         */
        'D_LOGO': [
            {
                'FOTO1': 'img/bandeira-petrobras.png',
                'FOTO2': 'img/logo-posto.png'
            }
        ]

    }
};

/* Indice sequencial: le do localStorage e avanca a cada finished() */
(function() {
    var KEY = 'mock_preco_idx';
    var idx = parseInt(localStorage.getItem(KEY) || '0', 10);
    if (isNaN(idx) || idx < 0) idx = 0;
    MOCK_DATA.currentIndex = idx;
    MOCK_DATA.advanceIndex = function(arrayLength) {
        var next = (MOCK_DATA.currentIndex + 1) % arrayLength;
        MOCK_DATA.currentIndex = next;
        localStorage.setItem(KEY, next);
        console.log('[MOCK] proximo combustivel idx=' + next);
    };
})();
