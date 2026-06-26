/**
 * MOCK DATA - climatempo_momento
 *
 * Simula o canal D_CLIMATEMPO_MOMENTO (temperatura atual)
 * Campos em UPPERCASE seguindo padrao XML EdgeContents
 *
 * IMPORTANTE: Alterar enabled para false em producao
 */

var MOCK_DATA = {
    enabled: true,
    dados: [
        {
            CIDADE: "São Paulo",
            CIDADE_SYS: "sao-paulo:sp:br",
            ICON: "4",  //'1', '1n','2','2r','2n', '2rn',  '3',  '3n',  '4', '4r',  '4n',  '4rn',  '4t',  '4tn',  '5',  '5n' ,  '6',  '6n',  '7',  '7n',  '8',  '9',   '11',
            TEMP_ATUAL: "13",
            TEMP_MAX: "13",
            TEMP_MIN: "13",
            DESCRICAO: "Chuvoso", // Chuvoso, Nublado, Parcialmente nublado, Ensolarado, Neve, Geada, Neblina, Tempestade
            UMIDADE: "72",
            VENTO_DIR: "N", // N, NE, E, SE, S, SW, W, NW
            VENTO_VEL: "12",
            VENTO_MAX: "18",
            VENTO_MIN: "5",
            PRECIPITATION: ""
        }
    ]
};
