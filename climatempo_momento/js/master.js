/**
 * master.js — climatempo_momento
 * ES5, compativel com Android 7+ (WebKit legado)
 *
 * Canal de dados: D_CLIMATEMPO_MOMENTO
 *
 * Campos esperados do XML:
 *   C1_CIDADE, C1_ICO, C1_MAX (temp atual),
 *   C1_HUMIDITYMIN, C1_WINDAVGVELOCITY,
 *   C1_WINDDIRECTION, C1_TEXTMIN
 */

/* CONFIG_CLIMA — configuracao global do template
 * Definido no index.html (deve vir antes de todos os scripts)
 *   iconStyle: 'fill' | 'flat' | 'line' | 'monochrome'
 *   iconColor: qualquer cor hex (ex: '#ffffff', '#ffcc00')
 *   duration:  tempo em ms que o template fica em tela (padrao: 10000)
 */

window.onload = function () {

    if (typeof MOCK_DATA !== "undefined" && MOCK_DATA.enabled) {
        var mockLoader = {
            loaded: function () { console.log("[Mock] Carregado"); },
            finished: function () { console.log("[Mock] Finalizado"); }
        };
        iniciarTemplate(MOCK_DATA.dados[0], CONFIG_CLIMA, mockLoader);
    } else {
        
        ebhtml.create2({}, function (loader) {
            loader.addData("D_CLIMA_CLIMATEMPO_MOMENTO", false, "", "");
            loader.autoloaded = false;
            loader.nodataiserror = false;

            loader.load(function () {
                var item = loader.data("D_CLIMA_CLIMATEMPO_MOMENTO");
                if (!item || item === undefined) {
                    console.error("[CLIMA MOMENTO] Sem dados");
                    loader.finished();
                    return;
                }

                var dados = {
                    CIDADE:     item.value("C1_CIDADE").value || "",
                    CIDADE_SYS: item.value("C1_CIDADE_SYS").value || "",
                    ICON:       item.value("C1_ICO").value || "",
                    TEMP_ATUAL: item.value("C1_MAX").value || "",
                    TEMP_MAX:   item.value("C1_MAX").value || "",
                    TEMP_MIN:   item.value("C1_MIN").value || "",
                    UMIDADE:    item.value("C1_HUMIDITYMIN").value || "",
                    VENTO_VEL:  item.value("C1_WINDAVGVELOCITY").value || "",
                    VENTO_DIR:  item.value("C1_WINDDIRECTION").value || "",
                    VENTO_MAX:  item.value("C1_WINDMAXVELOCITY").value || "",
                    VENTO_MIN:  item.value("C1_WINDMINVELOCITY").value || "",
                    DESCRICAO:  item.value("C1_TEXTMIN").value || ""
                };

                var config = CONFIG_CLIMA;
                iniciarTemplate(dados, config, loader);
            });
        });
    }
};

function iniciarTemplate(dados, config, loader) {
    // Centraliza cor dos icones via CONFIG_CLIMA (fallback: branco)
    var corIcone = (typeof CONFIG_CLIMA !== 'undefined' && CONFIG_CLIMA.iconColor)
        ? CONFIG_CLIMA.iconColor
        : '#ffffff';

    // Aplica background tematico conforme condicao climatica
    var bgClass = climaBackgroundClass(dados.ICON);
    if (bgClass) {
        document.body.className = document.body.className.replace(/bg-\w+/g, '');
        document.body.className = document.body.className + ' ' + bgClass;
    }

    // Cidade
    var cidadeEl = document.getElementById("cidade");
    if (cidadeEl && dados.CIDADE) {
        cidadeEl.innerText = dados.CIDADE;
    }

    // Temperatura principal (C1_MAX = temperatura atual)
    var tempMain = document.getElementById("temp-main");
    if (tempMain) {
        var temp = dados.TEMP_ATUAL || "--";
        tempMain.innerText = temp + "°C";
    }

    // Descricao do tempo
    var descEl = document.getElementById("descricao");
    if (descEl) {
        descEl.innerText = dados.DESCRICAO || "--";
    }

    // Umidade
    var humidityVal = document.getElementById("humidity-value");
    if (humidityVal) {
        humidityVal.innerText = (dados.UMIDADE || "--") + "%";
    }
    var humidityIcon = document.getElementById("humidity-icon");
    if (humidityIcon) {
        injetarMeteocon(humidityIcon, "humidity", corIcone);
    }

    // Vento — velocidade
    var windVal = document.getElementById("wind-value");
    if (windVal) {
        windVal.innerText = (dados.VENTO_VEL || "--") + "km/h";
    }
    var windIcon = document.getElementById("wind-icon");
    if (windIcon) {
        var nomeIconeVento = ventoVelocidadeParaIcone(dados.VENTO_VEL);
        injetarMeteocon(windIcon, nomeIconeVento);
    }

    // Vento — direcao (compass SVG com rotacao)
    var windDirIcon = document.getElementById("wind-dir-icon");
    if (windDirIcon && dados.VENTO_DIR) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'img/compass.svg', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;
            if (xhr.status === 200 || xhr.status === 0) {
                windDirIcon.innerHTML = xhr.responseText;
                var svg = windDirIcon.querySelector('svg');
                if (svg) {
                    svg.style.width = '100%';
                    svg.style.height = '100%';
                    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                    var ang = direcaoCardinalParaAngulo(dados.VENTO_DIR);
                    var path = svg.querySelector('path');
                    if (path) {
                        path.setAttribute('transform', 'rotate(' + ang + ' 12 12)');
                    }
                }
            }
        };
        xhr.send();
    }
    var windDirText = document.getElementById("wind-dir-text");
    if (windDirText) {
        windDirText.innerText = direcaoCardinalPorExtenso(dados.VENTO_DIR) || "--";
    }

    // Icone principal (Meteocon grande)
    var mainIcon = document.getElementById("main-icon");
    if (mainIcon) {
        var codigo = (dados.ICON || "3").toString();
        var nomeIcone = climaToMeteocon(codigo);
        injetarMeteocon(mainIcon, nomeIcone, corIcone);
    }

    // Fade in
    document.body.classList.remove("opacity-0");
    document.body.classList.add("opacity-100");

    // Playlist control
    if (loader) loader.loaded();

    setTimeout(function () {
        if (loader) loader.finished();
    }, config.duration || 10000);
}
