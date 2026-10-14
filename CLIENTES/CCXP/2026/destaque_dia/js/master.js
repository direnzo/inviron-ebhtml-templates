/**
 * CCXP26 - Destaque do Dia (Totem TV 1080x1920).
 * Fluxo: dados -> selecao -> midia/fonte -> loaded() -> intro -> 1 slide por destaque
 * -> encerramento -> finished(). loaded() sempre antes de finished(); finished() uma vez.
 * Selecao em js/destaques.js (testada em CLIENTES/CCXP/2026/tests). Ajustes: js/config.js.
 */
(() => {
    'use strict';

    const C = CONFIG;
    const T = C.tempos;         // tempos: ver js/config.js
    const ARTE_X = -1;          // PNGs 1081x1921: coluna 0 em alpha 25%, deslocar -1 px
    const ASC = 0.952;          // GothamCond-Ultra: ascendente e area de conteudo (em)
    const CONTEUDO = 0.952 + 0.222;

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

    /** Descricao ate cfg.linhas no tamanho da arte (sem encolher); acima disso corta com "...". */
    function ajustarDescricao(el, texto, cfg, baselineY) {
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
        if (cabe(el)) { return 'nominal'; }
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
        return 'cortado';
    }

    /** Ajusta a descricao e, com debug, registra o resultado em window.__textos (testes de limite). */
    function descricao(el, texto, cfg, baselineY) {
        const estado = ajustarDescricao(el, texto, cfg, baselineY);
        if (C.debug) {
            (window.__textos = window.__textos || []).push({
                caracteres: texto.length, estado: estado, tam: parseFloat(el.style.fontSize),
                cabe: cabe(el), final: el.textContent.length
            });
        }
    }

    // ---------- midia ----------
    function precarregar(url) {
        return new Promise((resolve) => {
            if (!url) { resolve(false); return; }
            const img = new Image();
            const timer = setTimeout(() => resolve(false), T.carregarMidia);
            img.onload = () => { clearTimeout(timer); resolve(true); };
            img.onerror = () => { clearTimeout(timer); resolve(false); };
            img.src = url; // handlers antes do src
        });
    }

    function carregarFonte() {
        if (!document.fonts || !document.fonts.load) { return Promise.resolve(false); }
        return Promise.race([
            document.fonts.load('100px "GothamCond-Ultra"').then((f) => f.length > 0),
            esperar(T.carregarMidia).then(() => false)
        ]).catch(() => false);
    }

    /**
     * opcoes.instantaneo: o video aparece cortado (sem fade). opcoes.aoTocar: roda no 1o quadro.
     * A opacidade so sobe no evento 'playing' (1o quadro decodificado): antes disso nada aparece por baixo.
     */
    function tocarVideo(video, ms, opcoes) {
        const op = opcoes || {};
        return new Promise((resolve) => {
            let feito = false;
            const watchdog = setTimeout(() => fim('watchdog'), ms + T.margemVideo);
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
            video.addEventListener('playing', () => {
                if (op.instantaneo) { video.style.transitionProperty = 'none'; }
                video.style.opacity = '1';
                if (op.instantaneo) { void video.offsetWidth; video.style.transitionProperty = ''; }
                if (op.aoTocar) { op.aoTocar(); }
            }, { once: true });
            const play = video.play();
            if (play && play.catch) { play.catch(() => fim('autoplay-negado')); }
        });
    }

    // ---------- slide ----------
    function caixa(el, x, y, w, h) {
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.width = w + 'px';
        el.style.height = h + 'px';
    }

    /**
     * Um slide: fundo do palco do proprio destaque (camada de fade) + conteudo (camada que desliza).
     * Retorna { slide, conteudo }.
     */
    function criarSlide(ev, midia) {
        const palco = palcoDe(ev.category);
        const slide = $('tplDestaque').content.firstElementChild.cloneNode(true);
        const conteudo = slide.querySelector('.slide-content');
        slide.style.transitionDuration = T.fadeFundo + 'ms';
        conteudo.style.transitionDuration = T.entrada + 'ms';
        slide.style.setProperty('--cor-palco', palco.fundo);
        if (palco.bg && midia[palco.bg]) {
            slide.style.backgroundImage = 'url("' + palco.bg + '")';
            slide.style.backgroundSize = '1081px 1921px';
            slide.style.backgroundPosition = ARTE_X + 'px 0';
        } else {
            slide.style.backgroundColor = palco.fundo; // PNG ausente / palco desconhecido: cor lisa
        }
        $('slides').appendChild(slide);

        const titulo = slide.querySelector('.frame-title');
        titulo.textContent = C.titulo.texto;
        titulo.style.color = palco.titulo;
        linha(titulo, C.titulo.y, C.titulo.tam);

        const f = slide.querySelector('.foto');
        caixa(f, C.foto.x, C.foto.y, C.foto.w, C.foto.h);
        if (ev.photo && midia[ev.photo]) { f.querySelector('img').src = ev.photo; } else { f.classList.add('sem-foto'); }

        const hora = slide.querySelector('.hora');
        hora.style.left = C.hora.x + 'px';
        hora.style.color = palco.hora;
        hora.style.letterSpacing = (C.hora.tam * C.hora.tracking / 1000) + 'px';
        hora.textContent = Programacao.formatHora(ev.startMs, C.fuso);
        linha(hora, C.hora.y, C.hora.tam);

        const d = slide.querySelector('.descricao');
        d.style.color = palco.texto;
        descricao(d, ev.title, C.descricao, C.descricao.y);
        return { slide: slide, conteudo: conteudo };
    }

    /** Barra do rodape (fixa por cima de tudo, inclusive dos videos): barra, logo e relogio. */
    function montarRodape() {
        const raiz = document.documentElement.style;
        raiz.setProperty('--foto-borda', C.foto.borda + 'px');
        raiz.setProperty('--foto-borda-cor', C.foto.bordaCor);
        const fundo = $('barraFundo');
        fundo.style.top = C.barra.y + 'px';
        fundo.style.height = C.barra.h + 'px';
        const logo = $('logo');
        caixa(logo, C.logo.x, C.logo.y, C.logo.w, C.logo.h);
        logo.src = 'img/logo_ccxp26.png';
        $('barra').style.opacity = '0'; // revelada no 1o quadro da abertura (ou no 1o slide)
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

        function semConteudo(motivo) { encerrar(motivo, T.liberarSemConteudo); }

        function iniciarRelogio() {
            const atualizar = () => {
                const texto = Programacao.formatRelogio(agoraMs(), C.fuso);
                if (relogio.textContent !== texto) { relogio.textContent = texto; }
            };
            atualizar();
            relogioTimer = setInterval(atualizar, T.atualizarRelogio);
        }

        /** Rodape fica por cima dos videos: so aparece junto com o 1o quadro da abertura (sem "piscada"). */
        function revelarRodape() { $('barra').style.opacity = '1'; }

        function conteudoEntra(item) {
            setTimeout(() => {
                item.conteudo.classList.remove('translate-x-full');
                item.conteudo.classList.add('translate-x-0');
            }, T.conteudoDelay);
        }

        function conteudoSai(item) {
            item.conteudo.classList.remove('translate-x-0');
            item.conteudo.classList.add('-translate-x-full');
        }

        /**
         * Camadas, como em 2025: o fundo do novo slide faz fade, o conteudo entra pela direita
         * logo depois e o anterior sai pela esquerda. O fundo anterior fica por baixo ate o novo
         * terminar o fade (sem "buraco" preto entre palcos diferentes) e so entao e removido.
         */
        function mostrar(item) {
            const anterior = atual;
            atual = item;
            if (!anterior) {
                // 1o slide: fundo ja pronto por baixo do video de abertura, que some em seguida.
                revelarRodape(); // abertura com falha: o rodape entra aqui
                item.slide.style.transitionProperty = 'none';
                item.slide.classList.remove('opacity-0');
                item.slide.classList.add('opacity-100');
                void item.slide.offsetWidth;
                item.slide.style.transitionProperty = '';
                videoIntro.style.opacity = '0';
            } else {
                void item.slide.offsetWidth; // fixa o estado inicial
                item.slide.classList.remove('opacity-0');
                item.slide.classList.add('opacity-100');
                conteudoSai(anterior);
                setTimeout(() => { anterior.slide.remove(); }, T.fadeFundo + T.entrada);
            }
            conteudoEntra(item);
        }

        async function executar(steps, itens) {
            let n = 0;
            for (const step of steps) {
                if (finalizado) { return; }
                log('step', step.type);
                if (step.type === 'intro') {
                    await tocarVideo(videoIntro, step.ms, { instantaneo: true, aoTocar: revelarRodape });
                } else if (step.type === 'outro') {
                    // O video cobre o slide (fundo liso, sem rodape): o conteudo sai antes dele entrar.
                    if (atual) { conteudoSai(atual); await esperar(T.pausaEncerramento); }
                    await tocarVideo(videoOutro, step.ms);
                } else {
                    mostrar(itens[n]);
                    n += 1;
                    await esperar(step.ms);
                }
            }
            encerrar('sequencia concluida', 0);
        }

        async function preparar(steps) {
            const fotos = [];
            const artes = [];
            steps.forEach((s) => (s.events || []).forEach((ev) => {
                if (ev.photo && fotos.indexOf(ev.photo) === -1) { fotos.push(ev.photo); }
                const bg = palcoDe(ev.category).bg;
                if (bg && artes.indexOf(bg) === -1) { artes.push(bg); }
            }));
            const urls = fotos.concat(artes, ['img/logo_ccxp26.png']);
            const [ok, fonteOk] = await Promise.all([Promise.all(urls.map(precarregar)), carregarFonte()]);
            if (!fonteOk) { log('fonte GothamCond-Ultra indisponivel; usando fallback'); }
            const midia = {};
            urls.forEach((url, i) => { midia[url] = ok[i]; });

            montarRodape();
            const itens = [];
            steps.forEach((s) => { if (s.type === 'destaque') { itens.push(criarSlide(s.events[0], midia)); } });
            return itens;
        }

        function aoCarregar() {
            clearTimeout(loadWatchdog);
            try {
                const eventos = lerEventos(loader);
                const selecao = Destaques.select(eventos, agoraMs(), {
                    offsetMin: C.fuso, fallbackDurationMin: 60, marcador: C.marcador, max: C.maxDestaques
                });
                const steps = Destaques.buildSteps(selecao, T);
                log('registros', eventos.length, 'destaques', selecao.encontrados, 'descartados', selecao.descartados,
                    'steps', steps.map((s) => s.type).join('>'));
                if (!steps.length) { semConteudo('sem destaque hoje'); return; }

                globalWatchdog = setTimeout(() => encerrar('watchdog global', 0),
                    Destaques.totalMs(steps) + 2 * T.carregarMidia + T.margemGlobal);
                preparar(steps).then((itens) => {
                    if (finalizado) { return; }
                    stage.classList.remove('opacity-0');
                    stage.classList.add('opacity-100');
                    iniciarRelogio();
                    chamarLoaded();
                    return executar(steps, itens);
                }).catch((erro) => semConteudo('excecao: ' + (erro && erro.message ? erro.message : erro)));
            } catch (erro) {
                semConteudo('excecao: ' + (erro && erro.message ? erro.message : erro));
            }
        }

        videoIntro.style.transitionDuration = T.fadeAbertura + 'ms';
        videoOutro.style.transitionDuration = T.fadeEncerramento + 'ms';
        videoIntro.src = C.videoIntro;
        videoOutro.src = C.videoOutro;

        // Sem filtro de palco: o destaque de qualquer palco entra; o marcador e filtrado no cliente.
        const params = ['amount=0', 'order=date', 'orderkind=a'];
        loader.addData(C.dataset, false, params.join('&'), '', C.basePath);
        loader.nodataiserror = false;
        loader.autoloaded = false;
        loadWatchdog = setTimeout(() => semConteudo('timeout do loader'), T.carregarDados);
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
