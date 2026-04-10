/**
 * Mock Data para VIDEOPORTO - Tarja de Serviços
 * Campos reais dos datasets D_CLIMA e D_CLIMA_CLIMATEMPO_MOMENTO.
 * Alterar enabled para false em produção.
 */

var MOCK_DATA = {
    enabled: true,  // Alterar para false em produção

    datasets: {
        // Temperatura atual, condição, umidade, vento, UV e marés
        'D_CLIMA_CLIMATEMPO_MOMENTO': {
            value: function(campo) {
                var dados = {
                    'C1_MAX':               '30',
                    'C1_MIN':               '30',
                    'C1_ICO':               '4',
                    'C1_TEXTMIN':           'Sol com muitas nuvens',
                    'C1_HUMIDITYMIN':       '78',
                    'C1_WINDAVGVELOCITY':   '26',
                    'C1_WINDDIRECTION':     'E',

                    // UV (deixar vazio para simular sem dados: 'C1_UV': '')
                    'C1_UV':                '9',
                    'C1_UVLEVEL':           'Máximo',

                    // Tábua de Marés — apenas A e B (XML real fornece 2 entradas)
                    'C1_MARINE_TIDE_A':        '04:02',
                    'C1_MARINE_TIDE_A_HEIGHT': '2.46',
                    'C1_MARINE_TIDE_B':        '10:08',
                    'C1_MARINE_TIDE_B_HEIGHT': '0.11',

                    // Timestamp de atualização (use horário recente para não cair no check de frescor)
                    'DT_UPDATE': (function() {
                        var agora = new Date();
                        var pad = function(n) { return n < 10 ? '0' + n : '' + n; };
                        return agora.getFullYear() + '-' +
                               pad(agora.getMonth() + 1) + '-' +
                               pad(agora.getDate()) + ' ' +
                               pad(agora.getHours()) + ':' +
                               pad(agora.getMinutes()) + ':' +
                               pad(agora.getSeconds());
                    }())
                };
                if (dados[campo] !== undefined) {
                    return { value: dados[campo] };
                }
                return null;
            }
        },

        // Previsão do dia: mínima e máxima
        'D_CLIMA': {
            value: function(campo) {
                var dados = {
                    'C1_D1_MIN': '28',
                    'C1_D1_MAX': '34'
                };
                if (dados[campo] !== undefined) {
                    return { value: dados[campo] };
                }
                return null;
            }
        }
    }
};
