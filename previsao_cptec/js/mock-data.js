/* Mock data para teste local sem backend EdgeContents.
   Para ativar: descomente a tag <script src="js/mock-data.js"> no index.html
   IMPORTANTE: desativar (enabled: false) antes do build de produção.
*/

var MOCK_DATA = {
    enabled: true,
    config: { duration: 10000 },
    dados: [
        {
            CIDADE: 'São Paulo - SP',
            ICO: '1',
            MAX: '28',
            MIN: '18'
        },
        {
            CIDADE: 'São Paulo - SP',
            ICO: '3',
            MAX: '25',
            MIN: '16'
        },
        {
            CIDADE: 'São Paulo - SP',
            ICO: '6',
            MAX: '22',
            MIN: '14'
        }
    ]
};
