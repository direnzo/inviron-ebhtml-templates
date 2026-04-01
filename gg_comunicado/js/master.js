// G&G Comunicado - master.js v2 (Slides)
// Template de comunicados institucionais - EdgeContents Digital Signage
// ES5 obrigatorio (Android 7+ WebKit)

// ─── CONFIGURACAO GLOBAL ──────────────────────────────────────────────────────

var CONFIG = {
    duration:          15000,  // tempo total do template (ms)
    minTempoPorSlide:  7500,   // minimo por slide em layouts de imagem/texto (ms)
    transicaoDuracao:  800     // duracao da transicao CSS (ms)
};

var CATEGORY_CONFIG = {
    'noticias_internas':         { fundo: 'noticias_internas.png' },
    'comunicados':               { fundo: 'comunicados.png' },
    'datas_comemorativas':       { fundo: 'datas_comemorativas.png' },
    'meetup':                    { fundo: 'meetup.png' },
    'historias_que_inspiram':    { fundo: 'historias_que_inspiram.png' },
    'sou_embaixador_da_cultura': { fundo: 'sou_embaixador_da_cultura.png' },
    'cliente_no_centro':         { fundo: 'cliente_no_centro.png' },
    'beneficios_selbetti':       { fundo: 'beneficios_selbetti.png' },
    'selbgames':                 { fundo: 'selbgames.png' }
};

// ─── MODO PLAYER (Digital Signage normal) ────────────────────────────────────

function playerView() {
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var indice = (typeof MOCK_DATA._forceIndex !== 'undefined')
            ? MOCK_DATA._forceIndex
            : Math.floor(Math.random() * MOCK_DATA.dados.length);
        var item = MOCK_DATA.dados[indice];
        console.log('[Mock] idx=' + indice + ' category=' + item.CATEGORY);

        var mockLoader = {
            loaded:   function() { console.log('[Mock] loaded'); },
            finished: function() { console.log('[Mock] finished'); }
        };

        iniciarTemplate(item, CONFIG, mockLoader);

    } else {
        ebhtml.create2({}, function(loader) {
            loader.addData('D_COMUNICADO', false);
            loader.autoloaded    = false;
            loader.nodataiserror = false;

            loader.load(function() {
                if (loader.data('D_COMUNICADO') == undefined) {
                    console.error('[gg_comunicado] Sem dados no canal D_COMUNICADO');
                    loader.finished();
                    return;
                }
                var d = loader.data('D_COMUNICADO');
                var dados = {
                    CATEGORY: d.value('CATEGORY').value,
                    TITULO:   d.value('TITULO').value,
                    TEXTO1:   d.value('TEXTO').value,
                    TEXTO2:   d.value('TEXTO2').value,
                    TEXTO3:   d.value('TEXTO3').value,
                    IMAGEM1:  d.value('FOTO').value,
                    IMAGEM2:  d.value('FOTO2').value,
                    IMAGEM3:  d.value('FOTO3').value
                };
                iniciarTemplate(dados, CONFIG, loader);
            });
        });
    }
}

// ─── UTILITARIOS ──────────────────────────────────────────────────────────

    function isVideo(url) {
        if (!url) return false;
        var u = url.toLowerCase();
        return u.indexOf('.mp4')  !== -1 ||
               u.indexOf('.webm') !== -1 ||
               u.indexOf('.mov')  !== -1 ||
               u.indexOf('.avi')  !== -1;
    }

    function aplicarFundo(category) {
        var img = document.getElementById('fundo-img');
        if (!img) return;
        var cfg = CATEGORY_CONFIG[category] || {};
        img.src = 'img/' + (cfg.fundo || 'generico.png');
    }

    function ajustarFontesSlide(idx) {
        var slideEl = document.getElementById('slide-' + idx);
        if (!slideEl) return;
        var caixa = slideEl.querySelector('[data-role="caixa"]');
        if (!caixa) return;

        // Aguarda layout estabilizar antes de medir
        setTimeout(function() {
            var titulo = slideEl.querySelector('[data-role="titulo"]');
            var corpo  = slideEl.querySelector('[data-role="body"]');

            // caixa tem altura definida (flex-1) em TODOS os layouts
            // scroll > offset = conteúdo transborda
            function excede() {
                return caixa.scrollHeight > caixa.offsetHeight;
            }

            if (caixa.offsetHeight <= 0) return;

            var tfs = titulo ? parseInt(window.getComputedStyle(titulo).fontSize) : 0;
            var bfs = corpo  ? parseInt(window.getComputedStyle(corpo).fontSize)  : 0;
            var iter = 0;

            // Fase 1: encolhe corpo até caber (min 11px)
            while (corpo && iter < 400 && excede() && bfs > 11) {
                bfs--;
                corpo.style.fontSize = bfs + 'px';
                iter++;
            }

            // Fase 2: encolhe título se ainda excede (min 12px)
            iter = 0;
            while (titulo && iter < 200 && excede() && tfs > 12) {
                tfs--;
                titulo.style.fontSize = tfs + 'px';
                iter++;
            }
        }, 200);
    }

    // ─── MONTAGEM DE SLIDES ───────────────────────────────────────────────────
    //
    // Logica de emparelhamento texto <-> midia:
    //   Só textos         → N slides full-text  (1 por texto)
    //   Só midias         → N slides full-image (1 por midia)
    //   Textos + Midias   → zip: par vira split; sobra vira full-text ou full-image
    //   Nada              → 1 slide full-text com o título
    //
    // Exemplos:
    //   t1  i0  → [full-text(t1)]
    //   t0  i1  → [full-image(i1)]
    //   t1  i1  → [split(t1,i1)]
    //   t2  i1  → [split(t1,i1), full-text(t2)]
    //   t2  i2  → [split(t1,i1), split(t2,i2)]
    //   t3  i2  → [split(t1,i1), split(t2,i2), full-text(t3)]

    function montarSlides(dados) {
        var textos = [];
        var midias = [];

        if (dados.TEXTO1 && dados.TEXTO1 !== '') textos.push(dados.TEXTO1);
        if (dados.TEXTO2 && dados.TEXTO2 !== '') textos.push(dados.TEXTO2);
        if (dados.TEXTO3 && dados.TEXTO3 !== '') textos.push(dados.TEXTO3);

        if (dados.IMAGEM1 && dados.IMAGEM1 !== '') midias.push(dados.IMAGEM1);
        if (dados.IMAGEM2 && dados.IMAGEM2 !== '') midias.push(dados.IMAGEM2);
        if (dados.IMAGEM3 && dados.IMAGEM3 !== '') midias.push(dados.IMAGEM3);

        var titulo = dados.TITULO || '';
        var slides = [];

        // Sem nada — apenas título
        if (textos.length === 0 && midias.length === 0) {
            slides.push({ tipo: 'full-text', titulo: titulo, texto: null, midia: null, ehVideo: false });
            return slides;
        }

        // Só textos
        if (midias.length === 0) {
            for (var i = 0; i < textos.length; i++) {
                slides.push({ tipo: 'full-text', titulo: titulo, texto: textos[i], midia: null, ehVideo: false });
            }
            return slides;
        }

        // Só mídias
        if (textos.length === 0) {
            for (var j = 0; j < midias.length; j++) {
                slides.push({ tipo: 'full-image', titulo: titulo, texto: null, midia: midias[j], ehVideo: isVideo(midias[j]) });
            }
            return slides;
        }

        // Textos + Mídias → emparelhar (zip)
        var n = Math.max(textos.length, midias.length);
        for (var i = 0; i < n; i++) {
            var txt = (i < textos.length) ? textos[i] : null;
            var mid = (i < midias.length) ? midias[i] : null;

            if (txt !== null && mid !== null) {
                slides.push({ tipo: 'split', titulo: titulo, texto: txt, midia: mid, ehVideo: isVideo(mid) });
            } else if (txt !== null) {
                slides.push({ tipo: 'full-text', titulo: titulo, texto: txt, midia: null, ehVideo: false });
            } else {
                slides.push({ tipo: 'full-image', titulo: titulo, texto: null, midia: mid, ehVideo: isVideo(mid) });
            }
        }

        return slides;
    }

    // ─── CRIACAO DE ELEMENTOS DE MIDIA ────────────────────────────────────────

    function criarMidiaEl(url, ehVideo, classes) {
        if (ehVideo) {
            var v = document.createElement('video');
            v.className = classes;
            v.src = url;
            v.muted  = true;
            v.volume = 0;
            v.setAttribute('autoplay', '');
            v.setAttribute('muted', '');
            v.setAttribute('playsinline', '');
            return v;
        }
        var img = document.createElement('img');
        img.className = classes;
        img.src = url;
        img.alt = '';
        return img;
    }

    // ─── CRIACAO DE SLIDES NO DOM ─────────────────────────────────────────────

    function criarSlideFullText(slide, idx) {
        var outer = document.createElement('div');
        outer.id = 'slide-' + idx;
        // items-stretch + p-10: caixa ocupa toda a altura definida do slide
        outer.className = 'absolute inset-0 flex items-stretch p-10';
        outer.setAttribute('data-layout', 'full-text');

        var box = document.createElement('div');
        // flex-1 garante altura definida = slide - padding, igual ao split
        box.className = 'flex-1 bg-black/40 backdrop-blur-sm rounded-2xl px-10 py-10 flex flex-col gap-5 overflow-hidden';
        box.setAttribute('data-role', 'caixa');

        if (slide.titulo) {
            var tEl = document.createElement('div');
            tEl.className = 'texto-comunicado text-white font-black';
            tEl.setAttribute('data-role', 'titulo');
            tEl.textContent = slide.titulo;
            box.appendChild(tEl);
        }

        if (slide.texto) {
            var pEl = document.createElement('div');
            pEl.className = 'texto-comunicado-body w-full';
            pEl.setAttribute('data-role', 'body');
            pEl.innerHTML = slide.texto;
            box.appendChild(pEl);
        }

        outer.appendChild(box);
        return outer;
    }

    function criarSlideFullImage(slide, idx) {
        var outer = document.createElement('div');
        outer.id = 'slide-' + idx;
        // mesmo padding do split para manter margem consistente
        outer.className = 'absolute inset-0 flex items-stretch p-8';

        var midiaSide = document.createElement('div');
        midiaSide.className = 'flex-1 relative rounded-2xl overflow-hidden';

        var midiaEl = criarMidiaEl(slide.midia, slide.ehVideo, 'w-full h-full object-cover');
        midiaSide.appendChild(midiaEl);

        if (slide.titulo) {
            var overlay = document.createElement('div');
            overlay.className = 'absolute bottom-0 left-0 right-0 px-10 pb-8 pt-20';
            overlay.style.background = 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)';

            var tEl = document.createElement('div');
            tEl.className = 'texto-comunicado text-white font-black';
            tEl.setAttribute('data-role', 'titulo');
            tEl.textContent = slide.titulo;
            overlay.appendChild(tEl);
            midiaSide.appendChild(overlay);
        }

        outer.appendChild(midiaSide);
        return outer;
    }

    function criarSlideSplit(slide, idx) {
        var outer = document.createElement('div');
        outer.id = 'slide-' + idx;
        // portrait empilha vertical; landscape lado a lado
        outer.className = 'absolute inset-0 flex portrait:flex-col gap-6 p-8';
        outer.setAttribute('data-layout', 'split');

        // Lado texto (flex-1 = 50%)
        var textoSide = document.createElement('div');
        textoSide.className = 'flex-1 flex flex-col min-w-0 min-h-0 bg-black/40 backdrop-blur-sm rounded-2xl px-10 py-10 gap-5 justify-center overflow-hidden';
        textoSide.setAttribute('data-role', 'caixa');

        if (slide.titulo) {
            var tEl = document.createElement('div');
            tEl.className = 'texto-comunicado text-white font-black';
            tEl.setAttribute('data-role', 'titulo');
            tEl.textContent = slide.titulo;
            textoSide.appendChild(tEl);
        }

        var pEl = document.createElement('div');
        pEl.className = 'texto-comunicado-body w-full';
        pEl.setAttribute('data-role', 'body');
        pEl.innerHTML = slide.texto || '';
        textoSide.appendChild(pEl);

        // Lado mídia (flex-1 = 50%)
        var midiaSide = document.createElement('div');
        midiaSide.className = 'flex-1 min-w-0 min-h-0 rounded-2xl overflow-hidden';

        var midiaEl = criarMidiaEl(slide.midia, slide.ehVideo, 'w-full h-full object-cover');
        midiaSide.appendChild(midiaEl);

        outer.appendChild(textoSide);
        outer.appendChild(midiaSide);
        return outer;
    }

    function criarSlide(slide, idx) {
        if (slide.tipo === 'full-image') return criarSlideFullImage(slide, idx);
        if (slide.tipo === 'split')      return criarSlideSplit(slide, idx);
        return criarSlideFullText(slide, idx);
    }

    // ─── PLAYBACK DE SLIDES ───────────────────────────────────────────────────

    function iniciarPlayback(slides, totalDuration, loader) {
        var container = document.getElementById('slide-container');
        var idxAtual  = 0;
        var tempoBase = Math.max(CONFIG.minTempoPorSlide, Math.floor(totalDuration / slides.length));

        // Criar DOM de todos os slides; slides futuros começam fora da tela (direita)
        for (var i = 0; i < slides.length; i++) {
            var el = criarSlide(slides[i], i);
            if (i > 0) {
                el.style.transform = 'translateX(100%)';
            }
            container.appendChild(el);
        }

        // ── Aguardar primeiro conteúdo ────────────────────────────────────────
        var s0 = slides[0];
        if (s0.midia && !s0.ehVideo) {
            var firstImg = container.querySelector('#slide-0 img');
            if (firstImg) {
                if (firstImg.complete && firstImg.naturalWidth > 0) {
                    onPronto();
                } else {
                    firstImg.onload  = onPronto;
                    firstImg.onerror = onPronto;
                }
                return;
            }
        }
        setTimeout(onPronto, 50);

        // ── Funções internas ──────────────────────────────────────────────────

        function onPronto() {
            document.body.classList.remove('opacity-0');
            document.body.classList.add('opacity-100');
            loader.loaded();
            ajustarFontesSlide(0);
            agendarProximo();
        }


        function transicionarPara(de, para, callback) {
            var slideDe   = document.getElementById('slide-' + de);
            var slidePara = document.getElementById('slide-' + para);
            if (!slideDe || !slidePara) {
                if (callback) callback();
                return;
            }

            // Posiciona next fora da tela sem transição, depois ativa ambas
            slidePara.style.transition = 'none';
            slidePara.style.transform  = 'translateX(100%)';
            void slidePara.offsetHeight; // força reflow

            var dur = CONFIG.transicaoDuracao + 'ms';
            slideDe.style.transition   = 'transform ' + dur + ' ease-in-out';
            slidePara.style.transition = 'transform ' + dur + ' ease-in-out';
            slideDe.style.transform    = 'translateX(-100%)';
            slidePara.style.transform  = 'translateX(0%)';

            setTimeout(function() {
                if (callback) callback();
            }, CONFIG.transicaoDuracao + 50);
        }

        function avancarSlide() {
            if (idxAtual >= slides.length - 1) {
                loader.finished();
                return;
            }
            var proximo = idxAtual + 1;
            ajustarFontesSlide(proximo);
            transicionarPara(idxAtual, proximo, function() {
                idxAtual = proximo;
                agendarProximo();
            });
        }

        function agendarProximo() {
            var slide           = slides[idxAtual];
            var idxCapturado    = idxAtual;

            if (slide.ehVideo) {
                var video = container.querySelector('#slide-' + idxAtual + ' video');
                if (video) {
                    video.onended = function() {
                        if (idxAtual === idxCapturado) avancarSlide();
                    };
                    // Safety timeout: 5 minutos por video
                    setTimeout(function() {
                        if (idxAtual === idxCapturado) avancarSlide();
                    }, 300000);
                    video.play();
                    return;
                }
            }

            setTimeout(avancarSlide, tempoBase);
        }
    }

    // ─── ENTRY POINT ─────────────────────────────────────────────────────────

    function iniciarTemplate(dados, cfg, loader) {
        aplicarFundo(dados.CATEGORY);

        var slides = montarSlides(dados);
        console.log('[gg_comunicado] slides=' + slides.length);
        for (var i = 0; i < slides.length; i++) {
            console.log('[gg_comunicado] slide[' + i + '] tipo=' + slides[i].tipo + (slides[i].ehVideo ? ' [VIDEO]' : ''));
        }

        iniciarPlayback(slides, cfg.duration, loader);
    }


