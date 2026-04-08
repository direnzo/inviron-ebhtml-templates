var data00 = new Date(),
    data01 = new Date(data00.getTime() + 86400000),
    data02 = new Date(data01.getTime() + 86400000),
    dia00,
    dia01,
    dia02,
    diaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    mes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

window.onload = function () {

    ebhtml.create2({}, function (loader) {

        loader.addData('D_CLIMA_CLIMATEMPO');
        loader.nodataiserror = false;
        loader.autoloaded = false;
        
        loader.load(function () {
            if(loader.data('D_CLIMA_CLIMATEMPO').value == ""){
                loader.finished();
            }else{

                dia00 = JSON.parse(loader.data('D_CLIMA_CLIMATEMPO').value('c1_d1_dataarray').value);
                dia01 = JSON.parse(loader.data('D_CLIMA_CLIMATEMPO').value('c1_d2_dataarray').value);
                dia02 = JSON.parse(loader.data('D_CLIMA_CLIMATEMPO').value('c1_d3_dataarray').value);
                
                if (new Date(data00.getFullYear(), data00.getMonth(), data00.getDate(), data00.getHours()).getTime() !== new Date(dia00[data00.getHours()].dt_date_wea * 1000).getTime()) {
                    loader.mediaLog('Dados de clima desatualizados');
                    loader.finished();
                } else {
                    document.querySelector('#cidade').innerText = dia00[data00.getHours()].city.ds_name_cit;
                    
                    preencheInfo(0, data00, dia00, function () {

                        preencheInfo(1, data01, dia01, function () {
                            
                            preencheInfo(2, data02, dia02, function () {
                                
                            loader.loaded();
                            
                            setTimeout(function() {
                                loader.finished();
                            }, 10000);
                            
                        });
                    });
                });
                
            }
            
        }
        });
    });
};

function preencheInfo(indice, data, dados, callback) {
    
    var previsao = document.getElementsByClassName('previsao')[indice];
    var imagem = previsao.querySelector('.icone');
    
    previsao.querySelector('.dia').innerText = diaSemana[data.getDay()];
    previsao.querySelector('.dia_mes').innerText = doubleDgts(data.getDate()) + '/' + mes[data.getMonth()];
    
    previsao.querySelector('.grau_max').innerText = dados[data.getHours()].nr_max_wea + '°';
    previsao.querySelector('.grau_min').innerText = dados[data.getHours()].nr_min_wea + '°';

    previsao.querySelector('.quant_chuva').innerText = 'Qtde. de Chuva: ' + dados[data.getHours()].nr_probrain_wea + ' mm';
    previsao.querySelector('.prob_chuva').innerText = 'Prob. de Chuva: ' + dados[data.getHours()].nr_precipitation_wea + '%';

    imagem.onload = function () {
        if (callback && typeof (callback) === "function") {
            callback();
        }
    }
    
    imagem.src = 'img/' + dados[data.getHours()].nr_icon_wea + '.gif';
    
}

function doubleDgts(num) {
    if (num < 10) {
        return '0' + num;
    }
    return num;
}