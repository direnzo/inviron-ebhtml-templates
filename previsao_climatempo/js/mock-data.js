/**
 * MOCK DATA - Dados de teste para desenvolvimento
 *
 * IMPORTANTE:
 * 1. Descomente <script src="js/mock-data.js"></script> no HTML para usar
 * 2. Altere enabled para false em produção
 * 3. Campos em UPPERCASE para compatibilidade com XML EdgeContents
 */

var MOCK_DATA = {
    enabled: true,  // Alterar para false em produção
    config: {
        duration: 10000
    },
    dados: [
        {
            CIDADE: "São Paulo",
            DIA: "Segunda",
            DATA: "27/05",
            MAX: "28",
            MIN: "17",
            ICON: "1",
            QTDE_CHUVA: "2",
            PROB_CHUVA: "10",
            VENTO_DIR: "SE",
            VENTO_VEL: "80",
            UV: "5",
            UVLEVEL: "Moderado"
        },
        {
            CIDADE: "São Paulo",
            DIA: "Terça",
            DATA: "28/05",
            MAX: "27",
            MIN: "16",
            ICON: "2",
            QTDE_CHUVA: "0",
            PROB_CHUVA: "0",
            VENTO_DIR: "N",
            VENTO_VEL: "8",
            UV: "3",
            UVLEVEL: "Baixo"
        },
        {
            CIDADE: "São Paulo",
            DIA: "Quarta",
            DATA: "29/05",
            MAX: "25",
            MIN: "15",
            ICON: "3",
            QTDE_CHUVA: "5",
            PROB_CHUVA: "30",
            VENTO_DIR: "WSW",
            VENTO_VEL: "15",
            UV: "8",
            UVLEVEL: "Muito Alto"
        }
    ]
};
