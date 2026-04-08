var diaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
var mes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

window.onload = function () {

    ebhtml.create2({}, function (loader) {

        loader.addData('D_CLIMA');
        loader.autoloaded = false;
        loader.nodataiserror = false;

        loader.load(function () {
            if (loader.data('D_CLIMA').value == '') {
                loader.finished();
                return;
            }

            var climaData = loader.data('D_CLIMA');

            function getValue(data, key) {
                return data.value(key).value || '';
            }

            var weatherData = [];
            for (var day = 1; day <= 3; day++) {
                weatherData.push({
                    cidade: getValue(climaData, 'C1_D' + day + '_CIDADE'),
                    cidade_sys: getValue(climaData, 'C1_D' + day + '_CIDADE_SYS'),
                    humidityMax: getValue(climaData, 'C1_D' + day + '_HUMIDITYMAX'),
                    humidityMin: getValue(climaData, 'C1_D' + day + '_HUMIDITYMIN'),
                    ico: getValue(climaData, 'C1_D' + day + '_ICO'),
                    max: getValue(climaData, 'C1_D' + day + '_MAX'),
                    min: getValue(climaData, 'C1_D' + day + '_MIN'),
                    sunrise: getValue(climaData, 'C1_D' + day + '_SUNRISE'),
                    sunset: getValue(climaData, 'C1_D' + day + '_SUNSET'),
                    windAvgVelocity: getValue(climaData, 'C1_D' + day + '_WINDAVGVELOCITY'),
                    windDirection: getValue(climaData, 'C1_D' + day + '_WINDDIRECTION'),
                    windMaxVelocity: getValue(climaData, 'C1_D' + day + '_WINDMAXVELOCITY'),
                    windMinVelocity: getValue(climaData, 'C1_D' + day + '_WINDMINVELOCITY')
                });
            }

            var dadosFormatados = [];
            for (var i = 0; i < weatherData.length; i++) {
                dadosFormatados.push({
                    nr_max_wea: weatherData[i].max,
                    nr_min_wea: weatherData[i].min,
                    nr_icon_wea: weatherData[i].ico,
                    cidade: weatherData[i].cidade
                });
            }

            var dataAtual = new Date();
            var data0 = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate());
            var data1 = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate() + 1);
            var data2 = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate() + 2);

            document.querySelector('#cidade').innerText = dadosFormatados[0].cidade;

            preencheInfo(0, data0, dadosFormatados, function () {
                preencheInfo(1, data1, dadosFormatados, function () {
                    preencheInfo(2, data2, dadosFormatados, function () {
                        loader.loaded();
                        setTimeout(function () {
                            loader.finished();
                        }, 10000);
                    });
                });
            });
        });
    });
};

function preencheInfo(indice, data, dados, callback) {
    var previsao = document.getElementsByClassName('previsao')[indice];
    var imagem = previsao.querySelector('.icone');

    previsao.querySelector('.dia').innerText = diaSemana[data.getDay()];
    previsao.querySelector('.dia_mes').innerText = doubleDgts(data.getDate()) + '/' + mes[data.getMonth()];

    previsao.querySelector('.grau_max').innerText = dados[indice].nr_max_wea + '°';
    previsao.querySelector('.grau_min').innerText = dados[indice].nr_min_wea + '°';

    imagem.onload = function () {
        if (callback && typeof callback === 'function') {
            callback();
        }
    };

    imagem.onerror = function () {
        if (callback && typeof callback === 'function') {
            callback();
        }
    };

    imagem.src = 'img/_' + dados[indice].nr_icon_wea + '.png';
}

function doubleDgts(num) {
    if (num < 10) {
        return '0' + num;
    }
    return num;
}