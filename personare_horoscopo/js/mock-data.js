/**
 * MOCK DATA - Dados de teste para desenvolvimento
 *
 * IMPORTANTE:
 * 1. Descomente <script src="js/mock-data.js"></script> no HTML para usar
 * 2. Altere enabled para false em producao
 * 3. Campos em UPPERCASE para compatibilidade com XML EdgeContents
 *
 * Estrutura real do XML (D_HOROSCOPO_PERSONARE_CURTO):
 *   SIGN  => ex: "br:aquario"  (icone: SIGN.substring(3) => "aquario" => img/aquario.png)
 *   TITLE => ex: "Aquario"
 *   TEXT  => texto do horoscopo
 */

var MOCK_DATA = {
    enabled: true,

    config: {
        duration: 15000
    },

    dados: [
        {
            SIGN:  'br:escorpiao',
            TITLE: 'Escorpião',
            TEXT:  'Escorpião, a harmonia entre Sol e Lua favorece a gestão prática do cotidiano. Cautela com finanças é essencial para manter o equilíbrio neste período.'
        }
    ]
};
