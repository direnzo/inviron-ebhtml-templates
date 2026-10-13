/**
 * CCXP26 - Programacao por palco (Totem TV 1080x1920).
 * Fluxo: dados -> selecao -> midia/fonte -> loaded() -> intro -> rolando -> daqui -> ainda
 * -> encerramento -> finished(). loaded() sempre antes de finished(); finished() uma vez.
 * Selecao em js/programacao.js (testada em CLIENTES/CCXP/2026/tests). Ajustes: js/config.js.
 */
(() => {
    'use strict';

    const C = CONFIG;
    const FADE = 300;           // troca entre steps (ms)
    const LOAD_TIMEOUT = 8000;  // dataset
    const MEDIA_TIMEOUT = 6000; // cada imagem / fonte
    const VIDEO_MARGIN = 1500;  // folga alem da duracao do video
    const EMPTY_DELAY = 100;    // loaded() -> finished() sem conteudo
    const OUTRO_DELAY = 150;    // pausa entre a saida do conteudo e o video de encerramento (2025)
    const ARTE_X = -1;          // PNGs 1081x1921: coluna 0 em alpha 25%, deslocar -1 px
    const ASC = 0.952;          // GothamCond-Ultra: ascendente e area de conteudo (em)
    const CONTEUDO = 0.952 + 0.222;
    const TITULOS = { rolando: 'Rolando agora', daqui: 'Daqui a pouco', ainda: 'Ainda hoje' };

    const log = (...args) => { if (C.debug) { console.log('[CCXP]', ...args); } };
    const $ = (id) => document.getElementById(id);
    const esperar = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

    function agoraMs() {
        if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled && MOCK_DATA.now) { return MOCK_DATA.now(); }
        return Date.now();
    }

    function lerEventos(loader) {
        const lista = loader.datalist(C.dataset);
        const eventos = [];
        const campo = (item, nome) => {
            const f = item.value(nome);
            return f && f.value != null ? String(f.value) : '';
        };
        for (let i = 0; lista && i < lista.count(); i += 1) {
            const item = lista.get(i);
            if (!item) { continue; }
            eventos.push({
                category: campo(item, 'CATEGORY'), titulo: campo(item, 'TITULO'), texto: campo(item, 'TEXTO'),
                texto2: campo(item, 'TEXTO2'), foto: campo(item, 'FOTO'), date: campo(item, 'DATE'),
                dtEnd: campo(item, 'DT_END'), dtUpdate: campo(item, 'DT_UPDATE')
            });
        }
        return eventos;
    }

    // ---------- texto ----------
    /** Posiciona por linha de base: topo da caixa para a 1a linha cair em baselineY. */
    function topoDaLinha(baselineY, tam, ent) {
        return baselineY - ((ent - CONTEUDO * tam) / 2 + ASC * tam);
    }

    /** Texto de 1 linha, ancorado pela linha de base. */
    function linha(el, baselineY, tam) {
        const ent = CONTEUDO * tam;
        el.style.fontSize = tam + 'px';
        el.style.lineHeight = ent + 'px';
        el.style.top = topoDaLinha(baselineY, tam, ent) + 'px';
        el.style.height = ent + 'px';
    }

    function cabe(el) {
        return el.scrollHeight <= el.clientHeight + 1 && el.scrollWidth <= el.clientWidth + 1;
    }

    /** Descricao ate cfg.linhas: tamanho da arte; reduz ate 60%; abaixo disso corta com "...". */
    function descricao(el, texto, cfg, baselineY) {
        const razao = cfg.ent / cfg.tam;
        const aplicar = (tam) => {
            const ent = tam * razao;
            const pad = Math.max(0, (CONTEUDO * tam - ent) / 2); // folga da fonte: nao corta acentos
            el.style.fontSize = tam + 'px';
            el.style.lineHeight = ent + 'px';
            el.style.paddingTop = pad + 'px';
            el.style.paddingBottom = pad + 'px';
            el.style.top = (topoDaLinha(baselineY, tam, ent) - pad) + 'px';
            el.style.height = (cfg.linhas * ent + 2 * pad) + 'px';
        };
        el.style.left = cfg.x + 'px';
        el.style.width = cfg.w + 'px';
        el.textContent = texto;
        aplicar(cfg.tam);
        if (cabe(el)) { return; }
        let lo = Math.floor(cfg.tam * 0.6);
        let hi = Math.floor(cfg.tam) - 1;
        while (lo < hi) {
            const mid = Math.ceil((lo + hi) / 2);
            aplicar(mid);
            if (cabe(el)) { lo = mid; } else { hi = mid - 1; }
        }
        aplicar(lo);
        if (cabe(el)) { return; }
        let a = 0;
        let b = texto.length;
        while (a < b) {
            const mid = Math.ceil((a + b) / 2);
            el.textContent = texto.slice(0, mid).trimEnd() + '...';
            if (cabe(el)) { a = mid; } else { b = mid - 1; }
        }
        let corte = texto.slice(0, a);
        const espaco = corte.lastIndexOf(' ');
        if (espaco > a * 0.6) { corte = corte.slice(0, espaco); }
        el.textContent = corte.trimEnd() + '...';
    }

    // ---------- midia ----------
    function precarregar(url) {
        return new Promise((resolve) => {
            if (!url) { resolve(false); return; }
            const img = new Image();
            const timer = setTimeout(() => resolve(false), MEDIA_TIMEOUT);
            img.onload = () => { clearTimeout(timer); resolve(true); };
            img.onerror = () => { clearTimeout(timer); resolve(false); };
            img.src = url; // handlers antes do src
        });
    }

    function carregarFonte() {
        if (!document.fonts || !document.fonts.load) { return Promise.resolve(false); }
        return Promise.race([
            document.fonts.load('100px "GothamCond-Ultra"').then((f) => f.length > 0),
            esperar(MEDIA_TIMEOUT).then(() => false)
        ]).catch(() => false);
    }

    function tocarVideo(video, ms) {
        return new Promise((resolve) => {
            let feito = false;
            const watchdog = setTimeout(() => fim('watchdog'), ms + VIDEO_MARGIN);
            function fim(motivo) {
                if (feito) { return; }
                feito = true;
                clearTimeout(watchdog);
                log('video', video.id, motivo);
                resolve();
            }
            video.addEventListener('ended', () => fim('ended'), { once: true });
            video.addEventListener('error', () => fim('error'), { once: true });
            if (video.error) { fim('error-previo'); return; }
            video.style.opacity = '1';
            const play = video.play();
            if (play && play.catch) { play.catch(() => fim('autoplay-negado')); }
        });
    }

    // ---------- paineis ----------
    function caixa(el, x, y, w, h) {
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.width = w + 'px';
        el.style.height = h + 'px';
    }

    function foto(wrapper, img, url, ok) {
        if (ok) { img.src = url; } else { wrapper.classList.add('sem-foto'); }
    }

    function novoPainel(modelo, tipo) {
        const painel = $(modelo).content.firstElementChild.cloneNode(true);
        $('panels').appendChild(painel);
        const titulo = painel.querySelector('.frame-title');
        titulo.textContent = TITULOS[tipo];
        titulo.style.color = C.p.titulo;
        linha(titulo, C.titulo.y, C.titulo.tam);
        return painel;
    }

    function painelUnico(tipo, ev, midia) {
        const painel = novoPainel('tplSingle', tipo);
        const f = painel.querySelector('.foto');
        caixa(f, C.foto.x, C.foto.y, C.foto.w, C.foto.h);
        foto(f, f.querySelector('img'), ev.photo, midia[ev.photo]);

        const hora = painel.querySelector('.hora');
        hora.style.left = C.hora.x + 'px';
        hora.style.color = C.p.hora;
        hora.textContent = Programacao.formatHora(ev.startMs, C.fuso);
        linha(hora, C.hora.y, C.hora.tam);

        const d = painel.querySelector('.descricao');
        d.style.color = C.p.texto;
        descricao(d, ev.title, C.descricao, C.descricao.y);
        return painel;
    }

    function painelLista(eventos, midia) {
        const painel = novoPainel('tplLista', 'ainda');
        const L = C.lista;
        eventos.forEach((ev, i) => {
            const y = L.y + i * L.passo;
            const item = $('tplItem').content.firstElementChild.cloneNode(true);
            painel.querySelector('.itens').appendChild(item);

            const f = item.querySelector('.thumb');
            caixa(f, L.foto.x, y, L.foto.tam, L.foto.tam);
            foto(f, f.querySelector('img'), ev.photo, midia[ev.photo]);

            const hora = item.querySelector('.hora');
            hora.style.left = L.hora.x + 'px';
            hora.style.color = C.p.hora;
            hora.textContent = Programacao.formatHora(ev.startMs, C.fuso);
            linha(hora, y + L.hora.dy, L.hora.tam);

            const d = item.querySelector('.descricao');
            d.style.color = C.p.texto;
            descricao(d, ev.title, L.descricao, y + L.descricao.dy);
        });
        return painel;
    }

    /** Fundo do palco, ornamento do topo e rodape: fixos durante todo o ciclo (como em 2025). */
    function montarFixos(midia) {
        const bg = $('bg');
        if (midia[C.bg]) {
            bg.style.backgroundImage = 'url("' + C.bg + '")';
            bg.style.backgroundSize = '1081px 1921px';
            bg.style.backgroundPosition = ARTE_X + 'px 0';
        } else {
            bg.style.backgroundColor = C.p.fundo; // PNG ausente: cor do palco
        }
        const topo = $('topo');
        if (midia[C.topo]) {
            topo.src = C.topo;
            topo.style.left = ARTE_X + 'px';
            topo.style.top = '0';
        } else {
            topo.remove();
        }
        const fundo = $('barraFundo');
        fundo.style.top = C.barra.y + 'px';
        fundo.style.height = C.barra.h + 'px';
        const logo = $('logo');
        caixa(logo, C.logo.x, C.logo.y, C.logo.w, C.logo.h);
        logo.src = 'img/logo_ccxp26.png';
        const relogio = $('relogio');
        relogio.style.width = C.relogio.direita + 'px';
        linha(relogio, C.relogio.y, C.relogio.tam);
    }

    // ---------- player ----------
    function iniciar(loader) {
        let loadedChamado = false;
        let finalizado = false;
        let loadWatchdog = null;
        let globalWatchdog = null;
        let relogioTimer = null;
        let atual = null;

        const stage = $('stage');
        const relogio = $('relogio');
        const videoIntro = $('videoIntro');
        const videoOutro = $('videoOutro');

        function chamarLoaded() {
            if (loadedChamado) { return; }
            loadedChamado = true;
            loader.loaded();
        }

        /** Unico caminho de saida: loaded() garantido antes de finished(), uma vez so. */
        function encerrar(motivo, atraso) {
            if (finalizado) { return; }
            finalizado = true;
            clearTimeout(loadWatchdog);
            clearTimeout(globalWatchdog);
            clearInterval(relogioTimer);
            log('encerrar:', motivo);
            try { chamarLoaded(); } catch (erro) { log('loaded() falhou', erro); }
            setTimeout(() => { loader.finished(); }, atraso || 0);
        }

        function semConteudo(motivo) { encerrar(motivo, EMPTY_DELAY); }

        function iniciarRelogio() {
            const atualizar = () => {
                const texto = Programacao.formatRelogio(agoraMs(), C.fuso);
                if (relogio.textContent !== texto) { relogio.textContent = texto; }
            };
            atualizar();
            relogioTimer = setInterval(atualizar, 1000);
        }

        /**
         * Como em 2025: o novo conteudo entra pela direita enquanto o anterior sai pela esquerda
         * (1 s, ease-in-out). Fundo, ornamento e rodape nao se mexem.
         */
        function mostrar(painel) {
            void painel.offsetWidth; // fixa o estado inicial (fora da tela, a direita)
            painel.classList.remove('translate-x-full', 'opacity-0');
            painel.classList.add('translate-x-0', 'opacity-100');
            if (atual && atual !== painel) { sair(atual); }
            atual = painel;
        }

        function sair(painel) {
            painel.classList.remove('translate-x-0', 'opacity-100');
            painel.classList.add('-translate-x-full', 'opacity-0');
        }

        async function executar(steps, paineis) {
            for (const step of steps) {
                if (finalizado) { return; }
                log('step', step.type);
                if (step.type === 'intro') {
                    await tocarVideo(videoIntro, step.ms);
                } else if (step.type === 'outro') {
                    // O video de encerramento ja traz o proprio ornamento (outra cor): o do topo some.
                    if (atual) { sair(atual); await esperar(OUTRO_DELAY); }
                    $('topo').style.opacity = '0';
                    await tocarVideo(videoOutro, step.ms);
                } else {
                    videoIntro.style.opacity = '0'; // revela fundo + conteudo (o video termina nesse mesmo quadro)
                    mostrar(paineis[step.type]);
                    await esperar(step.ms);
                }
            }
            encerrar('sequencia concluida', 0);
        }

        async function preparar(steps) {
            const fotos = [];
            steps.forEach((s) => (s.events || []).forEach((ev) => {
                if (ev.photo && fotos.indexOf(ev.photo) === -1) { fotos.push(ev.photo); }
            }));
            const urls = fotos.concat([C.bg, C.topo, 'img/logo_ccxp26.png']);
            const [ok, fonteOk] = await Promise.all([Promise.all(urls.map(precarregar)), carregarFonte()]);
            if (!fonteOk) { log('fonte GothamCond-Ultra indisponivel; usando fallback'); }
            const midia = {};
            urls.forEach((url, i) => { midia[url] = ok[i]; });

            const paineis = {};
            steps.forEach((s) => {
                if (s.type === 'rolando' || s.type === 'daqui') { paineis[s.type] = painelUnico(s.type, s.events[0], midia); }
                if (s.type === 'ainda') { paineis.ainda = painelLista(s.events, midia); }
            });
            montarFixos(midia);
            return paineis;
        }

        function aoCarregar() {
            clearTimeout(loadWatchdog);
            try {
                const eventos = lerEventos(loader);
                const selecao = Programacao.select(eventos, agoraMs(), {
                    offsetMin: C.fuso, stageId: C.palco, filterClientSide: true,
                    fallbackDurationMin: 60, maxLista: C.maxLista
                });
                const steps = Programacao.buildSteps(selecao, C.tempos);
                log('registros', eventos.length, 'descartados', selecao.descartados, 'steps', steps.map((s) => s.type).join('>'));
                if (!steps.length) { semConteudo('sem conteudo para o palco'); return; }

                globalWatchdog = setTimeout(() => encerrar('watchdog global', 0),
                    Programacao.totalMs(steps) + 2 * MEDIA_TIMEOUT + 15000);
                preparar(steps).then((paineis) => {
                    if (finalizado) { return; }
                    stage.classList.remove('opacity-0');
                    stage.classList.add('opacity-100');
                    iniciarRelogio();
                    chamarLoaded();
                    return executar(steps, paineis);
                }).catch((erro) => semConteudo('excecao: ' + (erro && erro.message ? erro.message : erro)));
            } catch (erro) {
                semConteudo('excecao: ' + (erro && erro.message ? erro.message : erro));
            }
        }

        const raiz = document.documentElement.style;
        raiz.setProperty('--cor-palco', C.p.fundo);
        videoIntro.src = C.videoIntro;
        videoOutro.src = C.videoOutro;

        const params = ['amount=0', 'f_category=' + encodeURIComponent(C.palco), 'order=date', 'orderkind=a'];
        loader.addData(C.dataset, false, params.join('&'), '', C.basePath);
        loader.nodataiserror = false;
        loader.autoloaded = false;
        loadWatchdog = setTimeout(() => semConteudo('timeout do loader'), LOAD_TIMEOUT);
        loader.load(aoCarregar, () => { clearTimeout(loadWatchdog); semConteudo('falha no load'); });
    }

    window.addEventListener('load', () => {
        const ajustar = () => {
            const s = Math.min(window.innerWidth / 1080, window.innerHeight / 1920);
            $('stage').style.transform = 'scale(' + s + ')';
        };
        ajustar();
        window.addEventListener('resize', ajustar);
        ebhtml.create2({}, iniciar);
    });
})();
