var diaSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
var mes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/* ─── Gera markup de um card ────────────────────────────────────────── */
function criarCardHTML(indice) {
    var delay = (indice + 1) + 's';
    /*
      Cascata de tamanho top-down:
        body → main (flex-1) → card (stretch, 100% altura) → 2 boxes (flex-1 cada)

      Landscape (flex-col):
        card: 28% largura, height = 100% do main (via align-items:stretch)
        box-icone: flex-1, min-h-0  → 50% da altura do card
        box-dados:  flex-1, min-h-0 → 50% da altura do card

      Portrait (flex-row):
        card: 90% largura, height = auto (conteúdo)
        box-icone: w-[35%], h-full  → largura fixa, altura = card
        box-dados:  flex-1          → largura restante
    */
    return (
        '<div class="previsao-card' +
            ' flex flex-col portrait:flex-row' +
            ' w-[28%] portrait:w-[90%]' +
            ' bg-black/80 rounded-2xl overflow-hidden' +
            ' opacity-0 animate-slide-in-left"' +
            ' style="animation-delay:' + delay + '; -webkit-animation-delay:' + delay + '">' +

            /* ── Box 1: Ícone ── preenche o espaço disponível */
            '<div class="box-icone' +
                ' flex-1 min-h-0 portrait:flex-none portrait:w-[35%]' +
                ' flex items-center justify-center' +
                ' p-[8%] portrait:p-[5%]">' +
                '<img class="icone max-h-full max-w-full object-contain block" src="" alt="">' +
            '</div>' +

            /* ── Box 2: Dados ── distribui dia / data / graus uniformemente */
            '<div class="box-dados' +
                ' flex-1 min-h-0' +
                ' flex flex-col items-center portrait:items-start justify-around' +
                ' px-[6%] pb-[8%] pt-0 portrait:py-[6%] portrait:pr-[8%]">' +

                '<p class="dia leading-none text-[4vmin]"></p>' +
                '<p class="dia-mes leading-none text-[3.5vmin]"></p>' +

                /* Setas + temperaturas: h em vmin para proporcionar com a fonte */
                '<div class="graus flex items-center justify-center portrait:justify-start gap-[5%] w-full">' +
                    '<img class="h-[5vmin] w-auto object-contain flex-none" src="img/setamax.png" alt="max">' +
                    '<p class="grau-max leading-none text-[6vmin]"></p>' +
                    '<img class="h-[5vmin] w-auto object-contain flex-none" src="img/setamin.png" alt="min">' +
                    '<p class="grau-min leading-none text-[6vmin]"></p>' +
                '</div>' +

            '</div>' +

        '</div>'
    );
}

/* ─── Preenche dados em um card ─────────────────────────────────────── */
function preencheCard(indice, data, dado, callback) {
    var cards = document.getElementsByClassName('previsao-card');
    var card = cards[indice];

    card.querySelector('.dia').innerText = diaSemana[data.getDay()];
    card.querySelector('.dia-mes').innerText = doubleDgts(data.getDate()) + '/' + mes[data.getMonth()];
    card.querySelector('.grau-max').innerText = dado.nr_max_wea + '°';
    card.querySelector('.grau-min').innerText = dado.nr_min_wea + '°';

    var imagem = card.querySelector('.icone');
    imagem.onload = function () {
        if (callback && typeof callback === 'function') { callback(); }
    };
    imagem.onerror = function () {
        if (callback && typeof callback === 'function') { callback(); }
    };
    imagem.src = 'img/_' + dado.nr_icon_wea + '.png';
}

/* ─── Renderiza e inicia template ───────────────────────────────────── */
function iniciarTemplate(dadosFormatados, config, loader) {
    var container = document.getElementById('cards-container');
    var dataAtual = new Date();
    var datas = [
        new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate()),
        new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate() + 1),
        new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate() + 2)
    ];

    var html = '';
    for (var i = 0; i < 3; i++) { html += criarCardHTML(i); }
    container.innerHTML = html;

    preencheCard(0, datas[0], dadosFormatados[0], function () {
        preencheCard(1, datas[1], dadosFormatados[1], function () {
            preencheCard(2, datas[2], dadosFormatados[2], function () {
                var body = document.querySelector('body');
                body.classList.remove('opacity-0');
                body.classList.add('opacity-100');
                loader.loaded();
                setTimeout(function () { loader.finished(); }, config.duration);
            });
        });
    });
}

/* ─── Entry point ───────────────────────────────────────────────────── */
window.onload = function () {

    /* ── MOCK ── */
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var mockLoader = {
            loaded:   function () { console.log('[Mock] loaded()'); },
            finished: function () { console.log('[Mock] finished()'); },
            mediaLog: function (msg) { console.warn('[Mock]', msg); }
        };

        var mockDados = [];
        for (var m = 0; m < MOCK_DATA.dados.length; m++) {
            mockDados.push({
                nr_max_wea:  MOCK_DATA.dados[m].MAX,
                nr_min_wea:  MOCK_DATA.dados[m].MIN,
                nr_icon_wea: MOCK_DATA.dados[m].ICO,
                cidade:      MOCK_DATA.dados[m].CIDADE
            });
        }
        document.querySelector('#cidade').innerText = mockDados[0].cidade;
        iniciarTemplate(mockDados, MOCK_DATA.config, mockLoader);
        return;
    }

    /* ── EBHTML ── */
    ebhtml.create2({}, function (loader) {

        loader.addData('D_CLIMA');
        loader.autoloaded = false;
        loader.nodataiserror = false;

        loader.load(function () {
            var climaDataRaw = loader.data('D_CLIMA');

            if (!climaDataRaw || !climaDataRaw.value || climaDataRaw.value == '') {
                loader.mediaLog('ERRO: Sem dados D_CLIMA');
                loader.finished();
                return;
            }

            try {
                var climaData = climaDataRaw;

                function getValue(data, key) {
                    try {
                        return data.value(key).value || '';
                    } catch (e) {
                        return '';
                    }
                }

                var weatherData = [];
                for (var day = 1; day <= 3; day++) {
                    weatherData.push({
                        cidade: getValue(climaData, 'C1_D' + day + '_CIDADE'),
                        ico:    getValue(climaData, 'C1_D' + day + '_ICO'),
                        max:    getValue(climaData, 'C1_D' + day + '_MAX'),
                        min:    getValue(climaData, 'C1_D' + day + '_MIN')
                    });
                }

                var dadosFormatados = [];
                for (var i = 0; i < weatherData.length; i++) {
                    dadosFormatados.push({
                        nr_max_wea:  weatherData[i].max,
                        nr_min_wea:  weatherData[i].min,
                        nr_icon_wea: weatherData[i].ico,
                        cidade:      weatherData[i].cidade
                    });
                }

                if (dadosFormatados.length < 3) {
                    loader.mediaLog('ERRO: Dados insuficientes (' + dadosFormatados.length + ' dias)');
                    loader.finished();
                    return;
                }

                document.querySelector('#cidade').innerText = dadosFormatados[0].cidade;
                iniciarTemplate(dadosFormatados, { duration: 10000 }, loader);

            } catch (e) {
                loader.mediaLog('ERRO: Falha ao processar dados - ' + e.message);
                loader.finished();
            }

        }, function (erro) {
            loader.mediaLog('ERRO: Falha ao carregar D_CLIMA - ' + (erro || 'desconhecido'));
            loader.finished();
        });
    });
};

function doubleDgts(num) {
    if (num < 10) { return '0' + num; }
    return num;
}
