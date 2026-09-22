// Mock completo — todos os 7 índices visíveis (08/04/2026)
var MOCK_DATA = {
    enabled: true,
    config: { duration: 10000 },
    dados: {
        datahora:    '2026-04-08 09:14:45',
        // Timestamps simulando fechamento real de cada bolsa (horário BRT)
        m1_nome: 'Bovespa',         m1_var:  1.59,  m1_atualiza: '2026-04-08 09:00:00', // fechou às 18h ontem → dentro de 10h
        m2_nome: 'NASDAQ',          m2_var: -0.72,  m2_atualiza: '2026-04-08 06:00:00', // fechou às 21h ontem → dentro de 10h
        m3_nome: 'Londres',         m3_var:  0.35,  m3_atualiza: '2026-04-08 07:30:00', // fechou às 13:30h → dentro de 10h
        m4_nome: 'Japão',           m4_var: -1.04,  m4_atualiza: '2026-04-08 03:30:00', // fechou às 03:30h → dentro de 10h às 13:30h
        m5_nome: 'Dólar Comercial', m5_valor: 5.44, m5_var: -0.9,  m5_atualiza: '2026-04-08 09:00:00',
        m6_nome: 'Dólar Turismo',   m6_valor: 5.66, m6_var:  0.12, m6_atualiza: '2026-04-08 09:00:00',
        m7_nome: 'Euro',            m7_valor: 6.4,  m7_var: -0.48, m7_atualiza: '2026-04-08 09:00:00'
    }
};
