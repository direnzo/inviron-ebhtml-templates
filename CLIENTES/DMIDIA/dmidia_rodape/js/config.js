var CONFIG = {
    timing: {
        duration: 600000, // Total display time in milliseconds (10 minutes)
        fadeDuration: 0,
        clockInterval: 1000,
        weatherInterval: 300000, // Weather refresh interval, independent of duration
        loadTimeout: 8000,
        maxWeatherAge: 4200000 // Maximum age of weather data in milliseconds (70 minutes)
    },
    dataset: {
        name: 'D_CLIMA_HGBRASIL',
        parameters: 'amount=1',
        field: 'C1_D1_DATAARRAY',
        temperatureField: 'nr_value_wea',
        updatedField: 'DT_UPDATE'
    },
    layout: {
        safeAreaTopVh: 0,
        safeAreaBottomVh: 0,
        fontSizeVmin: 50,
        horizontalPaddingEm: 0.5,
        informationSpacingEm: 1,
        logoHeightPercent: 80,
        logoPath: 'img/logo.png'
    },
    colors: { background: '#000000', text: '#ffffff' }
};

function aplicarConfigVisual() {
    var root = document.documentElement.style;
    root.setProperty('--cor-fundo', CONFIG.colors.background);
    root.setProperty('--cor-texto', CONFIG.colors.text);
    document.body.style.fontSize = CONFIG.layout.fontSizeVmin + 'vmin';
    var rodape = document.getElementById('rodape');
    rodape.style.top = CONFIG.layout.safeAreaTopVh + 'vh';
    rodape.style.bottom = CONFIG.layout.safeAreaBottomVh + 'vh';
    rodape.style.paddingLeft = CONFIG.layout.horizontalPaddingEm + 'em';
    rodape.style.paddingRight = CONFIG.layout.horizontalPaddingEm + 'em';
    rodape.style.transitionDuration = CONFIG.timing.fadeDuration + 'ms';
    document.getElementById('logo').style.height = CONFIG.layout.logoHeightPercent + '%';
    document.getElementById('temperatura').style.marginRight = CONFIG.layout.informationSpacingEm + 'em';
}