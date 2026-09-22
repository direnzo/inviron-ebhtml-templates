/**
 * wave-effect.js — ES5
 * Background animado com ondas moduladas por Perlin Noise.
 * Adaptado do script usado em inviron.com.br
 *
 * Depende de: perlin.js (global noise)
 * Config: WAVE_CONFIG (definir antes do load)
 */

var WAVE_CONFIG = {
    enabled: true,
    topMargin: 0,
    bottomMargin: 120,
    waveSpacing: 12,
    amplitudeBase: 80,
    amplitudeNoise: 40,
    periodBase: 3,
    periodNoise: 4,
    phaseNoise: 3,
    color: '255, 255, 255',
    alphaBase: 0.4,
    alphaRange: 0.3,
    lineWidth: 1,
    speed: 3000
};

/**
 * Inicializa o efeito de ondas em um container
 * @param {HTMLElement} container - Elemento que receberá o canvas
 * @param {Object} config - Sobreposição de WAVE_CONFIG
 */
function initWaveEffect(container, config) {
    if (!container) { return; }

    // Merge config
    var cfg = {};
    for (var k in WAVE_CONFIG) {
        if (WAVE_CONFIG.hasOwnProperty(k)) {
            cfg[k] = WAVE_CONFIG[k];
        }
    }
    if (config) {
        for (var k2 in config) {
            if (config.hasOwnProperty(k2)) {
                cfg[k2] = config[k2];
            }
        }
    }

    // Hardware fraco = desliga
    if (typeof isWeakDevice !== 'undefined' && isWeakDevice()) {
        container.style.display = 'none';
        return;
    }

    // Verifica Perlin Noise
    if (typeof noise === 'undefined') {
        console.warn('[Wave] noise não definido. Omitindo ondas.');
        return;
    }

    var canvas = document.createElement('canvas');
    canvas.id = 'waveCanvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '1';
    canvas.style.pointerEvents = 'none';
    container.appendChild(canvas);

    var ctx = null;
    var w = 0;
    var h = 0;
    var tick = 0;
    var animId = null;
    var destroyed = false;

    function setup() {
        noise.seed(Math.random());
        ctx = canvas.getContext('2d');
        w = canvas.width = container.clientWidth;
        h = canvas.height = container.clientHeight;
        tick = 0;
        destroyed = false;

        // Resize
        var resizeTimer = null;
        window.addEventListener('resize', function() {
            if (resizeTimer) { clearTimeout(resizeTimer); }
            resizeTimer = setTimeout(function() {
                if (destroyed) { return; }
                w = canvas.width = container.clientWidth;
                h = canvas.height = container.clientHeight;
            }, 200);
        });
    }

    function wave(y0) {
        var mx = 0; // mouseX simplificado (0 = sem interação)
        var my = 0;

        var a = cfg.amplitudeBase + noise.perlin2(mx + 2500 + tick, my + y0 / 200 + tick) * cfg.amplitudeNoise;
        var p = cfg.periodBase + noise.perlin2(1300 + tick, my + y0 / 200 + tick) * cfg.periodNoise;
        var phase = noise.perlin2(mx + 2000 + tick, my + y0 / 200 + tick) * cfg.phaseNoise;

        var alphaNoise = noise.perlin2(300 + tick, y0 / 200 + tick);
        var alpha = cfg.alphaBase + (alphaNoise * cfg.alphaRange);
        alpha = Math.max(0, Math.min(1, alpha));

        ctx.strokeStyle = 'rgba(' + cfg.color + ', ' + alpha + ')';
        ctx.beginPath();

        for (var x = 0; x < w; x += 2) {
            var y = Math.sin((x / w) * p + phase) * a + y0;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    function waves() {
        ctx.lineWidth = cfg.lineWidth;
        for (var y0 = cfg.topMargin; y0 < h - cfg.bottomMargin; y0 += cfg.waveSpacing) {
            wave(y0);
        }
    }

    function draw(now) {
        if (destroyed) { return; }
        ctx.fillStyle = 'transparent';
        ctx.clearRect(0, 0, w, h);
        waves();
        tick = now / cfg.speed;
        animId = requestAnimationFrame(draw);
    }

    function destroy() {
        destroyed = true;
        if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
        }
        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
    }

    setup();
    draw(0);

    return { destroy: destroy };
}
