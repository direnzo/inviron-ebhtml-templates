/**
 * MOCK DATA - climatempo_momento
 *
 * Simula o canal D_CLIMATEMPO_MOMENTO (temperatura atual)
 * Campos em UPPERCASE seguindo padrao XML EdgeContents
 *
 * IMPORTANTE: Alterar enabled para false em producao
 */

/* CONFIG_CLIMA — altera estilo e cor dos icones Meteocons
 *   iconStyle: 'fill' | 'flat' | 'line' | 'monochrome'
 *   iconColor: qualquer cor hex (ex: '#ffffff', '#ffcc00')
 */
var CONFIG_CLIMA = {
    iconStyle: 'fill',
    iconColor: '#ffffff'
};

var MOCK_DATA = {
    enabled: true,
    config: {
        duration: 8000
    },
    dados: [
        {
            CIDADE: "São Paulo",
            CIDADE_SYS: "sao-paulo:sp:br",
            ICON: "11",
            TEMP_ATUAL: "13",
            TEMP_MAX: "13",
            TEMP_MIN: "13",
            DESCRICAO: "Chuvoso",
            UMIDADE: "72",
            VENTO_DIR: "W",
            VENTO_VEL: "12",
            VENTO_MAX: "18",
            VENTO_MIN: "5",
            SENSACAO: "26"
        }
    ]
};
