var CONFIG = {
    corFundo: '',
    corTexto: '#000000',
    corDestaque: '#f0c040',
    logoPath: 'img/logo_even.png',
    logoAlt: 'Logo Cliente',
    logoPosicao: 'esquerda',
    relogioPosicao: 'direita',
    conteudoVisivel: true,
    itemDuracao: 7000,
    fadeDuracao: 1000,
    canais: [
        { tipo: 'clima', ativo: true, dataset: 'D_CLIMA_CLIMATEMPO' },
        { tipo: 'financeiro', ativo: true, dataset: 'D_AWESOMEAPI' }
    ],
    corClimaPrincipal: '#000000', // cor dos ícones de clima, dólar, euro
    corClimaSecundaria: '#888888', // cor secundária (ex: roxo convertido para cinza)
    refreshIntervalo: 10 * 60 * 1000, // ms — recarrega dados dos canais (padrão: 10 min)
};