var rodapeState = {
    loader: null,
    loaded: false,
    finished: false,
    weatherPending: false,
    weatherUpdatedAt: 0,
    clockTimer: null,
    weatherTimer: null,
    weatherWatchdog: null,
    logoWatchdog: null,
    durationTimer: null
};

function atualizarRelogio() {
    var agora = new Date();
    var hora = ('0' + agora.getHours()).slice(-2) + ':' + ('0' + agora.getMinutes()).slice(-2);
    var relogio = document.getElementById('relogio');
    relogio.textContent = hora;
    relogio.setAttribute('datetime', hora);
    if (rodapeState.weatherUpdatedAt && agora.getTime() - rodapeState.weatherUpdatedAt > CONFIG.timing.maxWeatherAge) {
        ocultarTemperatura();
    }
}

function ocultarTemperatura() {
    var temperatura = document.getElementById('temperatura');
    temperatura.textContent = '';
    temperatura.style.visibility = 'hidden';
    rodapeState.weatherUpdatedAt = 0;
}

function formatarDataHoraClima(timestamp) {
    var data = new Date(timestamp);
    function doisDigitos(valor) { return ('0' + valor).slice(-2); }
    return doisDigitos(data.getDate()) + '/' + doisDigitos(data.getMonth() + 1) + '/' + data.getFullYear() + ' ' +
        doisDigitos(data.getHours()) + ':' + doisDigitos(data.getMinutes()) + ':' + doisDigitos(data.getSeconds());
}

function converterDataHoraClima(valor) {
    if (valor === null || typeof valor === 'undefined') { return NaN; }
    var partes = String(valor).replace(/^\s+|\s+$/g, '').match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
    if (!partes) { return NaN; }
    var ano = parseInt(partes[1], 10);
    var mes = parseInt(partes[2], 10) - 1;
    var dia = parseInt(partes[3], 10);
    var hora = parseInt(partes[4], 10);
    var minuto = parseInt(partes[5], 10);
    var segundo = parseInt(partes[6], 10);
    var data = new Date(ano, mes, dia, hora, minuto, segundo);
    if (data.getFullYear() !== ano || data.getMonth() !== mes || data.getDate() !== dia ||
        data.getHours() !== hora || data.getMinutes() !== minuto || data.getSeconds() !== segundo) { return NaN; }
    return data.getTime();
}

function renderizarClima(item) {
    if (!item || typeof item.value !== 'function') { ocultarTemperatura(); return; }
    var campo = item.value(CONFIG.dataset.field);
    var registros = campo && campo.value ? JSON.parse(campo.value) : null;
    if (Object.prototype.toString.call(registros) !== '[object Array]' || !registros.length || !registros[0]) {
        if (window.console && typeof window.console.log === 'function') {
            window.console.log('[Dmidia][Clima] Nenhum registro de clima recebido.');
        }
        ocultarTemperatura();
        return;
    }
    var registro = registros[0];
    var valor = registro[CONFIG.dataset.temperatureField];
    var texto = valor === null || typeof valor === 'undefined' ? '' : String(valor).replace(/^\s+|\s+$/g, '');
    var campoAtualizacao = item.value(CONFIG.dataset.updatedField);
    var timestampAtualizacao = campoAtualizacao && typeof campoAtualizacao.value !== 'undefined' ? campoAtualizacao.value : '';
    var atualizadoEm = converterDataHoraClima(timestampAtualizacao);
    var idade = new Date().getTime() - atualizadoEm;
    var dataHoraAtualizacao = isFinite(atualizadoEm) && atualizadoEm > 0 ? formatarDataHoraClima(atualizadoEm) : 'invalida';
    if (window.console && typeof window.console.log === 'function') {
        window.console.log('[Dmidia][Clima] ' + CONFIG.dataset.updatedField + '=' + timestampAtualizacao +
            ' | data/hora local=' + dataHoraAtualizacao + ' | idade em minutos=' +
            (isFinite(idade) ? Math.round(idade / 60000) : 'invalida'));
    }
    if (!/^-?\d+(?:[.,]\d+)?$/.test(texto) || !isFinite(atualizadoEm) || atualizadoEm <= 0 || idade < 0 || idade > CONFIG.timing.maxWeatherAge) {
        ocultarTemperatura();
        return;
    }
    document.getElementById('temperatura').textContent = texto + '\u00b0';
    document.getElementById('temperatura').style.visibility = 'visible';
    rodapeState.weatherUpdatedAt = atualizadoEm;
}

function carregarClima() {
    if (!rodapeState.loader || rodapeState.finished || rodapeState.weatherPending) { return; }
    rodapeState.weatherPending = true;
    rodapeState.weatherWatchdog = setTimeout(function () {
        rodapeState.weatherPending = false;
        ocultarTemperatura();
    }, CONFIG.timing.loadTimeout);
    function concluirConsulta() {
        clearTimeout(rodapeState.weatherWatchdog);
        rodapeState.weatherPending = false;
    }
    try {
        rodapeState.loader.load(function () {
            concluirConsulta();
            if (rodapeState.finished) { return; }
            try {
                renderizarClima(rodapeState.loader.data(CONFIG.dataset.name));
            } catch (erro) {
                ocultarTemperatura();
            }
        }, function () {
            concluirConsulta();
            ocultarTemperatura();
        });
    } catch (erro) {
        concluirConsulta();
        ocultarTemperatura();
    }
}

function sinalizarPronto() {
    if (rodapeState.loaded || !rodapeState.loader) { return; }
    clearTimeout(rodapeState.logoWatchdog);
    document.getElementById('rodape').style.opacity = '1';
    rodapeState.loaded = true;
    rodapeState.loader.loaded();
    if (CONFIG.timing.duration > 0) {
        rodapeState.durationTimer = setTimeout(encerrarRodape, CONFIG.timing.duration);
    }
}

function encerrarRodape() {
    if (rodapeState.finished || !rodapeState.loader) { return; }
    sinalizarPronto();
    rodapeState.finished = true;
    clearInterval(rodapeState.clockTimer);
    clearInterval(rodapeState.weatherTimer);
    clearTimeout(rodapeState.weatherWatchdog);
    clearTimeout(rodapeState.logoWatchdog);
    clearTimeout(rodapeState.durationTimer);
    rodapeState.loader.finished();
}

function iniciarLogo() {
    var logo = document.getElementById('logo');
    logo.onload = sinalizarPronto;
    logo.onerror = function () {
        logo.style.visibility = 'hidden';
        sinalizarPronto();
    };
    rodapeState.logoWatchdog = setTimeout(function () {
        logo.style.visibility = 'hidden';
        sinalizarPronto();
    }, CONFIG.timing.loadTimeout);
    logo.src = CONFIG.layout.logoPath;
}

window.onload = function () {
    aplicarConfigVisual();
    atualizarRelogio();
    rodapeState.clockTimer = setInterval(atualizarRelogio, CONFIG.timing.clockInterval);
    ebhtml.create2({}, function (loader) {
        rodapeState.loader = loader;
        loader.autoloaded = false;
        loader.nodataiserror = false;
        loader.addData(CONFIG.dataset.name, false, CONFIG.dataset.parameters);
        iniciarLogo();
        carregarClima();
        rodapeState.weatherTimer = setInterval(carregarClima, CONFIG.timing.weatherInterval);
    });
};