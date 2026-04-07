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
            SIGN:  'br:aquario',
            TITLE: 'Aquário',
            TEXT:  'Para Aquário, o céu aponta para uma conexão criativa e inspiradora com amigos. No amor, autoconfiança e paciência são essenciais para cultivar relacionamentos saudáveis.'
        },
        {
            SIGN:  'br:gemeos',
            TITLE: 'Gêmeos',
            TEXT:  'Gêmeos, o céu indica um dia favorável para diálogos e conexões genuínas. Sua vida amorosa pede atenção e prudência ao tomar decisões importantes.'
        }
    ]
};
