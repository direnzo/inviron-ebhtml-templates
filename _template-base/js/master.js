/**
 * TEMPLATE BASE - EdgeContents Digital Signage
 * 
 * ATENÇÃO: Use apenas JavaScript ES5 (compatibilidade Android 7+)
 * - Não use arrow functions: () => {}
 * - Não use let/const, apenas var
 * - Não use template strings: `texto ${var}`
 * - Use concatenação: 'texto ' + variavel
 * - Evite o uso de bibliotecas externas
 * - Evite o uso excessivo de funções modernas
 * - Evite o uso excessivo de console.log
 */

// Dataset principal (altere conforme necessário)
var DATASET = 'D_INSTITUCIONAL';

// Configurações
var config = {
    duration: 15000,    // tempo total (ms) - pode ser sobrescrito por DURATION
    slideTime: 5000,    // tempo por slide (se lista)
    maxItems: 10,       // máximo de itens (se lista)
    debug: true         // exibir logs no console
};

// Função para ajustar fonte até caber no container
function fitDescriptionFont(el, container, minFont, maxFont) {
    if (!el || !container) { return; }
    if (!minFont) { minFont = 10; }
    if (!maxFont) { maxFont = 100; }
    if (!el.innerHTML || el.innerHTML.replace(/\s/g, '') === '') { return; }

    try {
        el.style.fontSize = maxFont + 'px';
        var fontSize = maxFont;
        var cw = container.clientWidth;
        var ch = container.clientHeight;
        if (cw <= 0 || ch <= 0) { return; }

        while (fontSize > minFont) {
            if (el.scrollWidth <= cw && el.scrollHeight <= ch) { break; }
            fontSize -= 1;
            el.style.fontSize = fontSize + 'px';
        }
    } catch (e) {
        el.style.fontSize = '16px';
    }
}

// Detecção de plataforma
function isAndroid() {
    return /Android/i.test(navigator.userAgent);
}

function isWeakDevice() {
    var dpr = window.devicePixelRatio || 1;
    var w = window.innerWidth || 0;
    return isAndroid() && (dpr <= 1 || w <= 1280);
}

window.onload = function() {
    var body = document.body;
    
    // Degradação para hardware fraco
    if (isWeakDevice()) {
        body.classList.add('reduced');
        if (config.debug) console.log('[Base] Hardware fraco detectado; aplicando .reduced');
    }
    
    var image = document.getElementById('image');
    var titleEl = document.getElementById('title');
    var descEl = document.getElementById('description');
    var logoWrap = document.getElementById('logoWrap');
    var titleBox = document.getElementById('titleBox');
    var descBox = document.getElementById('descBox');
    var qrWrap = document.getElementById('qrWrap');
    var footerText = document.getElementById('footerText');
    var photoLayer = document.getElementById('photoLayer');
    
    // ════════════════════════════════════════════════════════════════════
    // FLUXO PRINCIPAL EBHTML
    // ════════════════════════════════════════════════════════════════════
    ebhtml.create2({}, function(loader) {
        loader.addData(DATASET, false); // false = não obrigatório
        loader.nodataiserror = false;   // sem dados não é erro
        loader.autoloaded = false;      // controle manual
        
        loader.load(function() {
            var data = loader.data(DATASET);
            if (data == undefined) {
                console.error('[Base] ERRO: dataset indefinido');
                loader.finished(); // apenas finished(), sem loaded()
                return;
            }
            
            // Ler configurações opcionais do dataset
            try {
                var durationData = data.value('DURATION');
                if (durationData && durationData.value) {
                    config.duration = parseInt(durationData.value, 10) || config.duration;
                }
            } catch (e) {}
            
            try {
                var slideData = data.value('SLIDE_TIME');
                if (slideData && slideData.value) {
                    config.slideTime = parseInt(slideData.value, 10) || config.slideTime;
                }
            } catch (e) {}
            
            // Campos obrigatórios (padrão EdgeContents)
            var titulo = data.value('TITULO') ? data.value('TITULO').value : '';
            var texto = data.value('TEXTO') ? data.value('TEXTO').value : '';
            var fotoUrl = data.value('FOTO') ? data.value('FOTO').value : '';
            var cor = data.value('COR') ? data.value('COR').value : '';
            var footer = data.value('FOOTER') ? data.value('FOOTER').value : '';
            
            // Popular elementos DOM
            if (titleEl) titleEl.innerHTML = titulo;
            if (descEl) descEl.innerHTML = texto;
            if (footerText && footer) footerText.innerHTML = footer;
            if (cor && titleBox) titleBox.style.backgroundColor = cor;
            
            // Imagem de fundo
            image.onload = function() {
                // Fade-in do body
                body.classList.remove('opacity-0');
                body.classList.add('opacity-100');
                
                // Animações (somente se não for hardware fraco)
                if (!body.classList.contains('reduced')) {
                    image.classList.remove('scale-100');
                    image.classList.add('scale-110');
                    if (photoLayer) photoLayer.classList.add('translate-x-1/5');
                    if (logoWrap) logoWrap.classList.add('wipeIntro');
                    if (titleBox) titleBox.classList.add('wipeIntro');
                    if (descBox) descBox.classList.add('wipeIntro');
                    if (qrWrap) qrWrap.classList.add('wipeIntro');
                    if (footerText) footerText.classList.add('wipeIntro');
                }
                
                // Ajuste tipográfico
                fitDescriptionFont(titleEl, titleBox, 12, 110); // título 12-110px
                fitDescriptionFont(descEl, descBox, 10, 90);    // descrição 10-90px
                
                // ⚠️ OBRIGATÓRIO: loaded() apenas em sucesso
                loader.loaded();
                
                // Agendar finalização
                setTimeout(function() {
                    loader.finished();
                }, config.duration);
                
                if (config.debug) console.log('[Base] Carregado com sucesso; finaliza em ' + config.duration + 'ms');
            };
            
            image.onerror = function() {
                console.error('[Base] Erro ao carregar imagem');
                // ❌ NÃO CHAMA loaded() em erro
                loader.finished();
            };
            
            image.src = fotoUrl;
        });
    });
};



