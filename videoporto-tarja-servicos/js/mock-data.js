/**
 * Mock Data para VIDEOPORTO - Tarja de Serviços
 * Comentar MOCK_DATA.enabled = false em produção
 */

var MOCK_DATA = {
    enabled: true,  // Alterar para false em produção
    
    datasets: {
        'D_CLIMA_CLIMATEMPO': {
            // Simula item com method .value()
            value: function(campo) {
                var dados = {
                    'CONDICAO': 'Nublado',
                    'TEMPERATURA': '30',
                    'MINIMA': '28',
                    'MAXIMA': '34',
                    'UMIDADE': '78',
                    'VENTO': '26',
                    'ONDAS_ALTURA': '2.4',
                    'ONDAS_HORARIO': '04:02',
                    'UV_INDICE': '9',
                    'UV_DESC': 'Máximo',
                };
                
                if (dados[campo]) {
                    return { value: dados[campo] };
                }
                return null;
            },
            
            // Simula método count() para datalist
            count: function() {
                return 1;
            },
            
            // Simula método get() para datalist
            get: function(idx) {
                if (idx === 0) return this;
                return null;
            }
        },
        
        'D_CAMBIO': {
            value: function(campo) {
                var dados = {
                    'MOEDA': 'USD',
                    'COTACAO': '5.45',
                    'VARIACAO': '+0.15',
                    'V1': '2.46m',
                    'H1': '04:02',
                    'V2': '0.11m',
                    'H2': '10:08',
                    'V3': '2.10m',
                    'H3': '16:17',
                    'V4': '0.32m',
                    'H4': '22:14'
                };
                
                if (dados[campo]) {
                    return { value: dados[campo] };
                }
                return null;
            },
            
            count: function() {
                return 1;
            },
            
            get: function(idx) {
                if (idx === 0) return this;
                return null;
            }
        },
        
        'D_COMUNICADO': {
            value: function(campo) {
                var dados = {
                    'MENSAGEM': 'Proteja sua pele! O nível de UV agora pela manhã está altíssimo.',
                    'TIPO': 'ALERTA',
                };
                
                if (dados[campo]) {
                    return { value: dados[campo] };
                }
                return null;
            },
            
            count: function() {
                return 1;
            },
            
            get: function(idx) {
                if (idx === 0) return this;
                return null;
            }
        }
    }
};
