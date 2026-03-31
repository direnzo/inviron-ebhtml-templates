/**
 * MOCK DATA - maely-temp-humid
 * Dados de teste para desenvolvimento local.
 *
 * Para testar o estado de ERRO, troque o objeto 'weather' pelo bloco comentado abaixo.
 * Em producao: comentar a linha <script src="js/mock-data.js"> no index.html
 */

var MOCK_DATA = {
    enabled: true,

    config: {
        duration: 12000,   // Duracao total (ms): tempo exibindo temperatura + umidade
        slideTime: 5000    // Tempo de cada slide (ms)
    },

    // Cenario SUCESSO:
    weather: {
        humidity: 40,
        temperature: 27.4,
        updateTime: "2026-03-31T13:58:58Z"
    }

    // Cenario ERRO (descomente para testar):
    // weather: {
    //     error: "Temperatura fora do intervalo",
    //     updateTime: "2026-03-31T13:31:06Z"
    // }
};
