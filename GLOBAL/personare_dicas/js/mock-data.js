/**
 * MOCK DATA - Dados de teste para desenvolvimento
 *
 * IMPORTANTE:
 * 1. Descomente <script src="js/mock-data.js"></script> no HTML para usar
 * 2. Altere enabled para false em producao
 *
 * Campos do XML real (D_PERSONARE):
 *   TITULO  => título da dica
 *   TEXTO   => texto da dica
 *   FOTO    => URL da imagem (ex: http://127.0.0.1:13199/FILES/105067)
 */

var MOCK_DATA = {
    enabled: true,

    config: {
        duration: 10000
    },

    dados: [
        {
            TITULO: 'Desligue a TV!',
            TEXTO:  'Substitua o som da televisão por uma música suave ou mantras usados para meditação para uma boa noite de sono.',
            FOTO:   'img/fundo.png'
        }
    ]
};
