/**
 * Mock Data para VIDEOPORTO - Tarja de Serviços
 * Comentar MOCK_DATA.enabled = false em produção
 * Todos os dados vêm de D_CLIMA_CLIMATEMPO.
 */

var MOCK_DATA = {
    enabled: true,  // Alterar para false em produção

    datasets: {
        'D_CLIMA_CLIMATEMPO': {
            value: function(campo) {
                var dados = {
                    // Slide 2: Previsão do tempo
                    'CONDICAO':    'Nublado',
                    'TEMPERATURA': '30',
                    'MINIMA':      '28',
                    'MAXIMA':      '34',
                    'PRECIPITACAO': '78',
                    'VENTO':       '26',

                    // Slide 3: Tábua de Marés (4 horários)
                    // MARE_D = 'alta' (seta verde, maré cheia) ou 'baixa' (seta amarela, maré vazia)
                    'MARE_V1': '2.46', 'MARE_H1': '04:02', 'MARE_D1': 'alta',
                    'MARE_V2': '0.11', 'MARE_H2': '10:08', 'MARE_D2': 'baixa',
                    'MARE_V3': '2.10', 'MARE_H3': '16:17', 'MARE_D3': 'alta',
                    'MARE_V4': '0.32', 'MARE_H4': '22:14', 'MARE_D4': 'baixa',

                    // Slide 4: Alerta UV
                    'UV_INDICE': '9',
                    'UV_DESC':   'Máximo'
                };

                if (dados[campo] !== undefined) {
                    return { value: dados[campo] };
                }
                return null;
            },

            count: function() { return 1; },
            get: function(idx) {
                if (idx === 0) return this;
                return null;
            }
        }
    }
};
