/**
 * MOCK DATA - Rodape Teste
 * 
 * IMPORTANTE:
 * 1. Descomente <script src="js/mock-data.js"></script> no HTML para usar
 * 2. Altere enabled para false em produção
 */

var MOCK_DATA = {
    enabled: true,

    config: {
        duration: 15000,
        logoPath: 'img/logo.png',
        logoAlt: 'Logo Cliente'
    },

    // Estrutura simulada do dataset D_CLIMA_CLIMATEMPO
    // C1_D1_DATAARRAY contém JSON em string (mesmo padrão do XML real)
    clima: {
        DEST_CIDID: 'sao-paulo:sp:br',
        DATE1: '2026-02-06',
        C1_D1_DATAARRAY: '[{"nr_value_wea":"25","nr_min_wea":"20","nr_max_wea":"30","mm_textpt_wea":"Parcialmente nublado","city":{"ds_name_cit":"São Paulo","ds_state_cit":"SP","ds_country_cit":"BR"}}]'
    }
};
