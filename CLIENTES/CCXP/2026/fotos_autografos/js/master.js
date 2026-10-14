/**
 * CCXP26 - Fotos e Autografos (painel LED 1280x512).
 * Fluxo: dados -> midia/fonte -> loaded() -> intro -> paginas de 2 artistas -> encerramento -> finished().
 * loaded() sempre antes de finished(); finished() uma vez. Ajustes: js/config.js.
 * ESQUELETO (fase 0): toca intro e encerramento quando ha registros; selecao e paginas entram nas fases 1-2.
 */
(() => {
    'use strict';

    const C = CONFIG;
    const T = C.tempos;

    const log = (...args) => { if (C.debug) { console.log('[CCXP]', ...args); } };
    const $ = (id) => document.getElementById(id);
    const esperar = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

    function agoraMs() {
        if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled && MOCK_DATA.now) { return MOCK_DATA.now(); }
        return Date.now();
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

    function tocarVideo(video, ms) {
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
            video.style.opacity = '1';
            const play = video.play();
            if (play && play.catch) { play.catch(() => fim('autoplay-negado')); }
        });
    }

    // ---------- player ----------
    function iniciar(loader) {
        let loadedChamado = false;
        let finalizado = false;
        let loadWatchdog = null;
        let globalWatchdog = null;

        const stage = $('stage');
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
            log('encerrar:', motivo);
            try { chamarLoaded(); } catch (erro) { log('loaded() falhou', erro); }
            setTimeout(() => { loader.finished(); }, atraso || 0);
        }

        function semConteudo(motivo) { encerrar(motivo, T.liberarSemConteudo); }

        async function executar() {
            await tocarVideo(videoIntro, T.intro);
            if (finalizado) { return; }
            videoIntro.style.opacity = '0';
            await tocarVideo(videoOutro, T.outro);
            encerrar('sequencia concluida', 0);
        }

        function aoCarregar() {
            clearTimeout(loadWatchdog);
            try {
                const lista = loader.datalist(C.dataset);
                const total = lista ? lista.count() : 0;
                log('registros', total);
                if (!total) { semConteudo('sem registros'); return; }

                globalWatchdog = setTimeout(() => encerrar('watchdog global', 0),
                    T.intro + T.outro + 2 * T.carregarMidia + T.margemGlobal);
                Promise.all([precarregar(C.fundo), carregarFonte()]).then(([fundoOk]) => {
                    if (finalizado) { return; }
                    if (fundoOk) {
                        const fundo = $('fundo');
                        fundo.src = C.fundo;
                        fundo.style.left = C.fundoX + 'px';
                        fundo.style.top = C.fundoY + 'px';
                    }
                    stage.classList.remove('opacity-0');
                    stage.classList.add('opacity-100');
                    chamarLoaded();
                    return executar();
                }).catch((erro) => semConteudo('excecao: ' + (erro && erro.message ? erro.message : erro)));
            } catch (erro) {
                semConteudo('excecao: ' + (erro && erro.message ? erro.message : erro));
            }
        }

        videoIntro.style.transitionDuration = T.fadeAbertura + 'ms';
        videoOutro.style.transitionDuration = T.fadeEncerramento + 'ms';
        videoIntro.src = C.videoIntro;
        videoOutro.src = C.videoOutro;

        // Sem filtro de data no servidor: o recorte "hoje" e feito no cliente (fuso -03:00).
        loader.addData(C.dataset, false, 'amount=0', '', C.basePath);
        loader.nodataiserror = false;
        loader.autoloaded = false;
        loadWatchdog = setTimeout(() => semConteudo('timeout do loader'), T.carregarDados);
        loader.load(aoCarregar, () => { clearTimeout(loadWatchdog); semConteudo('falha no load'); });
    }

    window.addEventListener('load', () => {
        const ajustar = () => {
            const s = Math.min(window.innerWidth / 1280, window.innerHeight / 512);
            $('stage').style.transform = 'scale(' + s + ')';
        };
        ajustar();
        window.addEventListener('resize', ajustar);
        ebhtml.create2({}, iniciar);
    });
})();
