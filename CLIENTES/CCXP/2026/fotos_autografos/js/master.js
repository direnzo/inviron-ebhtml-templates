/**
 * CCXP26 - Fotos e Autografos (painel LED 1280x512).
 * Fluxo: dados -> selecao -> midia/fonte -> loaded() -> intro -> paginas de 2 artistas -> encerramento
 * -> finished(). loaded() sempre antes de finished(); finished() uma vez.
 * Selecao em js/fea.js (testada em CLIENTES/CCXP/2026/tests). Ajustes: js/config.js.
 */
(() => {
    'use strict';

    const C = CONFIG;
    const T = C.tempos;         // tempos: ver js/config.js
    const LARGURA = 1280;       // tela do painel
    const ASC = 0.952;          // GothamCond-Ultra: ascendente e area de conteudo (em)
    const CONTEUDO = 0.952 + 0.222;
    const CURVA = 'cubic-bezier(0.4, 0, 0.2, 1)';
    const SELO_RAZAO = 22 / 103;   // img/selo.png: 103x22 px
    const FOTO_AUSENTE = '#17269D'; // cor das formas do fundo, escurecida pelo CSS (.sem-foto)

    const log = (...args) => { if (C.debug) { console.log('[CCXP]', ...args); } };
    const $ = (id) => document.getElementById(id);
    const esperar = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

    function agoraMs() {
        if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled && MOCK_DATA.now) { return MOCK_DATA.now(); }
        return Date.now();
    }

    /** Sessoes cruas do dataset, com os nomes de campo de CONFIG.campos. */
    function lerSessoes(loader) {
        const lista = loader.datalist(C.dataset);
        const k = C.campos;
        const campo = (item, nome) => {
            const f = item.value(nome);
            return f && f.value != null ? String(f.value) : '';
        };
        const sessoes = [];
        for (let i = 0; lista && i < lista.count(); i += 1) {
            const item = lista.get(i);
            if (!item) { continue; }
            sessoes.push({
                artista: campo(item, k.artista), foto: campo(item, k.foto), modalidade: campo(item, k.modalidade),
                data: campo(item, k.data), esgotado: campo(item, k.esgotado),
                horarioTexto: campo(item, k.horarioTexto)
            });
        }
        return sessoes;
    }

    // ---------- texto ----------
    /** Topo da caixa para a 1a linha cair em baselineY. */
    function topoDaLinha(baselineY, tam, ent) {
        return baselineY - ((ent - CONTEUDO * tam) / 2 + ASC * tam);
    }

    /** Texto de 1 linha ancorado pela linha de base; largura maxima opcional (encolhe e, no limite, corta). */
    function linha(el, x, baselineY, tam, larguraMax, tamMinimo) {
        const ent = CONTEUDO * tam;
        el.style.left = x + 'px';
        el.style.fontSize = tam + 'px';
        el.style.lineHeight = ent + 'px';
        el.style.top = topoDaLinha(baselineY, tam, ent) + 'px';
        el.style.height = ent + 'px';
        if (larguraMax && tamMinimo != null) {
            el.style.maxWidth = 'none';
            el.style.overflow = 'visible';
            el.style.textOverflow = 'clip';
            el.style.transform = 'none';
            el.style.transformOrigin = 'left top';
            const escala = $('stage').getBoundingClientRect().width / LARGURA || 1;
            const intervalo = document.createRange();
            intervalo.selectNodeContents(el);
            const medir = () => intervalo.getBoundingClientRect().width / escala;
            const limite = Math.max(0.1, larguraMax - 1);
            let tamanho = tam;
            if (medir() > limite) {
                let minimo = tamMinimo;
                let maximo = tam;
                for (let passo = 0; passo < 10; passo += 1) {
                    const candidato = (minimo + maximo) / 2;
                    el.style.fontSize = candidato + 'px';
                    if (medir() <= limite) { minimo = candidato; } else { maximo = candidato; }
                }
                tamanho = minimo;
            }
            el.style.fontSize = tamanho + 'px';
            el.style.lineHeight = CONTEUDO * tamanho + 'px';
            el.style.top = topoDaLinha(baselineY, tamanho, CONTEUDO * tamanho) + 'px';
            el.style.height = CONTEUDO * tamanho + 'px';
            const largura = medir();
            if (largura > limite) { el.style.transform = 'scaleX(' + limite / largura + ')'; }
            return;
        }
        if (larguraMax) {
            el.style.maxWidth = larguraMax + 'px';
            el.style.overflow = 'hidden';
            el.style.textOverflow = 'ellipsis';
            const w = el.scrollWidth;
            if (w > larguraMax) {
                let t = Math.max(tam * 0.6, tam * larguraMax / w);
                el.style.fontSize = t + 'px';
                el.style.lineHeight = CONTEUDO * t + 'px';
                el.style.top = topoDaLinha(baselineY, t, CONTEUDO * t) + 'px';
                el.style.height = CONTEUDO * t + 'px';
            }
        }
    }

    function cabe(el) {
        return el.scrollHeight <= el.clientHeight + 1 && el.scrollWidth <= el.clientWidth + 1;
    }

    /**
     * Titulo do artista ate cfg.linhas (2) no tamanho da arte; acima disso corta com "...".
     * 1 linha fica na ultima linha de base (junto da foto); 2 linhas usam as duas do modelo.
     */
    function ajustarTitulo(el, texto, cfg) {
        const ent = cfg.baselines[1] - cfg.baselines[0];
        const pad = Math.max(0, (CONTEUDO * cfg.tam - ent) / 2); // folga da fonte: nao corta acentos
        el.style.left = cfg.x + 'px';
        el.style.width = cfg.largura + 'px';
        el.style.fontSize = cfg.tam + 'px';
        el.style.lineHeight = ent + 'px';
        el.style.paddingTop = pad + 'px';
        el.style.paddingBottom = pad + 'px';
        el.style.height = 'auto';
        el.textContent = texto;
        const medir = () => {
            el.style.height = 'auto';
            return Math.max(1, Math.round((el.scrollHeight - 2 * pad) / ent));
        };
        const natural = medir();
        if (natural === 1 && el.scrollWidth <= el.clientWidth && cfg.tamUmaLinha > cfg.tam) {
            let minimo = cfg.tam;
            let maximo = cfg.tamUmaLinha;
            el.style.whiteSpace = 'nowrap';
            el.style.paddingTop = '0px';
            el.style.paddingBottom = '0px';
            for (let passo = 0; passo < 8; passo += 1) {
                const tamanho = (minimo + maximo) / 2;
                el.style.fontSize = tamanho + 'px';
                if (el.scrollWidth <= el.clientWidth) { minimo = tamanho; } else { maximo = tamanho; }
            }
            const baseline = Math.min(cfg.baselines[cfg.linhas - 1], C.foto.y - (CONTEUDO - ASC) * minimo);
            linha(el, cfg.x, baseline, minimo);
            return 'nominal';
        }
        el.style.height = (cfg.linhas * ent + 2 * pad) + 'px';
        let estado = 'nominal';
        if (natural > cfg.linhas || !cabe(el)) {
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
            estado = 'cortado';
        }
        // Depois do corte o texto pode ocupar menos linhas: 1 linha fica junto da foto.
        const n = Math.min(estado === 'cortado' ? medir() : natural, cfg.linhas);
        el.style.height = (cfg.linhas * ent + 2 * pad) + 'px';
        const primeira = cfg.baselines[cfg.linhas - n];
        el.style.top = (topoDaLinha(primeira, cfg.tam, ent) - pad) + 'px';
        return estado;
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

    /** instantaneo: o video aparece cortado no 1o quadro (sem fade), so depois de decodificado. */
    function tocarVideo(video, ms, instantaneo) {
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
            // Opacidade so no evento 'playing' (1o quadro pronto): antes disso nada do slide pode aparecer.
            video.addEventListener('playing', () => {
                if (instantaneo) { video.style.transitionProperty = 'none'; }
                video.style.opacity = '1';
                if (instantaneo) { void video.offsetWidth; video.style.transitionProperty = ''; }
            }, { once: true });
            const play = video.play();
            if (play && play.catch) { play.catch(() => fim('autoplay-negado')); }
        });
    }

    // ---------- pagina ----------
    function criar(classe, pai) {
        const el = document.createElement('div');
        el.className = classe;
        if (pai) { pai.appendChild(el); }
        return el;
    }

    /** Borda direita (px da tela) do conteudo do bloco: foto, rotulos, horarios e texto do titulo. */
    function extremoDireito(interno, titulo) {
        const escala = $('stage').getBoundingClientRect().width / LARGURA || 1; // preview escala o stage
        const base = interno.getBoundingClientRect().left;
        let fim = C.foto.x + C.foto.lado;
        interno.querySelectorAll('.rotulo, .horario').forEach((el) => {
            fim = Math.max(fim, el.offsetLeft + el.offsetWidth);
        });
        const r = document.createRange();
        r.selectNodeContents(titulo);
        Array.from(r.getClientRects()).forEach((rc) => { fim = Math.max(fim, (rc.right - base) / escala); });
        return fim;
    }

    /**
     * Um bloco de artista na posicao `lado` (0 esquerdo, 1 direito); `centralizar` posiciona o bloco
     * (como esquerdo) no centro da tela. Retorna o elemento que desliza; o conteudo fica em `interno`,
     * que recebe o deslocamento de centralizacao.
     */
    function criarBloco(artista, lado, midia, pagina, centralizar) {
        const dx = centralizar ? 0 : lado * C.deslocamentoBloco;
        const v = C.variantes[artista.variante] || C.variantes.compacta;
        const bloco = criar('bloco absolute inset-0', pagina);
        bloco.style.transform = 'translateX(100%)';
        const interno = criar('bloco-interno absolute', bloco);
        interno.style.left = '0px';
        interno.style.top = '0px';
        interno.style.width = '1280px';
        interno.style.height = '512px';

        const titulo = criar('titulo-artista absolute uppercase overflow-hidden', interno);
        titulo.style.color = C.titulo.cor;
        const estado = ajustarTitulo(titulo, artista.nome, Object.assign({}, C.titulo, { x: C.titulo.x + dx }));

        const f = criar('foto absolute box-border', interno);
        f.style.left = (C.foto.x + dx) + 'px';
        f.style.top = C.foto.y + 'px';
        f.style.width = C.foto.lado + 'px';
        f.style.height = C.foto.lado + 'px';
        f.style.setProperty('--cor-palco', FOTO_AUSENTE);
        const corte = criar('foto-corte absolute inset-0 overflow-hidden', f);
        const img = document.createElement('img');
        img.className = 'foto-img w-full h-full object-cover';
        img.alt = '';
        corte.appendChild(img);
        if (artista.foto && midia[artista.foto]) { img.src = artista.foto; } else { f.classList.add('sem-foto'); }

        const kSelo = v.tamHorario / C.variantes.compacta.tamHorario;
        artista.sessoes.slice(0, v.baselines.length).forEach((s, i) => {
            const base = v.baselines[i];
            const rotulo = criar('rotulo absolute whitespace-nowrap', interno);
            rotulo.style.color = C.corRotulo;
            rotulo.textContent = s.rotulo;
            linha(rotulo, v.xRotulo + dx, base, v.tamRotulo, 270);

            const horario = criar('horario absolute whitespace-nowrap', interno);
            horario.style.color = C.corHorario;
            horario.textContent = s.horario;
            const yHorario = base + v.horarioDelta;
            linha(horario, v.xHorario + dx, yHorario, v.tamHorario, v.larguraHorario, 1);

            if (s.esgotado) {
                const sc = C.selo;
                const w = sc.w * kSelo;
                const h = w * SELO_RAZAO;
                const selo = document.createElement('img');
                selo.className = 'selo absolute';
                selo.alt = '';
                selo.src = sc.img;
                selo.style.left = (v.xHorario + dx + sc.dx * kSelo - w / 2) + 'px';
                selo.style.top = (yHorario + sc.dy * kSelo - h / 2) + 'px';
                selo.style.width = w + 'px';
                selo.style.height = h + 'px';
                selo.style.transform = 'rotate(' + sc.rotacao + 'deg)';
                interno.appendChild(selo);
            }
        });
        if (centralizar) {
            const ini = Math.min(C.titulo.x, C.foto.x);
            const fim = extremoDireito(interno, titulo);
            interno.style.left = ((LARGURA - (fim - ini)) / 2 - ini) + 'px';
        }
        if (C.debug) {
            (window.__textos = window.__textos || []).push({
                centralizado: !!centralizar, artista: artista.nome, caracteres: artista.nome.length, estado: estado, variante: artista.variante,
                sessoes: artista.sessoes.length, tamTitulo: parseFloat(titulo.style.fontSize), cabe: cabe(titulo)
            });
        }
        return bloco;
    }

    /** Pagina = container com 1 bloco por artista (cada um desliza com seu atraso). Anexada ao DOM antes
     *  de montar os blocos: o ajuste de texto mede scrollHeight/scrollWidth. */
    function criarPagina(artistas, midia) {
        const pagina = criar('pagina absolute inset-0', $('paginas'));
        const lista = artistas.slice(0, C.itensPorPagina);
        const centralizar = C.centralizarUnico && lista.length === 1;
        const blocos = lista.map((a, i) => criarBloco(a, i, midia, pagina, centralizar));
        return { pagina: pagina, blocos: blocos };
    }

    function deslizar(bloco, para, atraso) {
        bloco.style.transition = 'transform ' + T.entrada + 'ms ' + CURVA + ' ' + atraso + 'ms';
        bloco.style.transform = 'translateX(' + para + ')';
    }

    // ---------- player ----------
    function iniciar(loader) {
        let loadedChamado = false;
        let finalizado = false;
        let loadWatchdog = null;
        let globalWatchdog = null;
        let atual = null;
        let fundoOk = false;

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

        /** O fundo so aparece quando a abertura termina: antes dela a tela e preta (sem "piscada"). */
        function revelarFundo() {
            if (fundoOk) { $('fundo').style.opacity = '1'; } else { stage.style.backgroundColor = '#004BC9'; }
        }

        function conteudoSai(item) {
            item.blocos.forEach((b, i) => { deslizar(b, '-100%', i * T.escalonarSaida); });
        }

        /** Novo conteudo entra pela direita (bloco esquerdo primeiro) e o anterior sai pela esquerda. */
        function mostrar(item) {
            const anterior = atual;
            atual = item;
            if (!anterior) {
                revelarFundo(); // por baixo do video de abertura, que some em seguida
                videoIntro.style.opacity = '0';
            } else {
                conteudoSai(anterior);
                setTimeout(() => { anterior.pagina.remove(); }, T.entrada + T.escalonarSaida * C.itensPorPagina);
            }
            void item.pagina.offsetWidth; // fixa o estado inicial (fora da tela, a direita)
            item.blocos.forEach((b, i) => { deslizar(b, '0', i * T.escalonar); });
        }

        async function executar(steps, itens) {
            let n = 0;
            for (const step of steps) {
                if (finalizado) { return; }
                log('step', step.type);
                if (step.type === 'intro') {
                    await tocarVideo(videoIntro, step.ms, true);
                } else if (step.type === 'outro') {
                    // O video cobre a tela: o conteudo sai antes dele entrar.
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
            steps.forEach((s) => (s.artistas || []).forEach((a) => {
                if (a.foto && fotos.indexOf(a.foto) === -1) { fotos.push(a.foto); }
            }));
            const urls = fotos.concat([C.fundo, C.selo.img]);
            const [ok, fonteOk] = await Promise.all([Promise.all(urls.map(precarregar)), carregarFonte()]);
            if (!fonteOk) { log('fonte GothamCond-Ultra indisponivel; usando fallback'); }
            const midia = {};
            urls.forEach((url, i) => { midia[url] = ok[i]; });

            const fundo = $('fundo');
            fundoOk = midia[C.fundo];
            fundo.style.opacity = '0';
            if (fundoOk) {
                fundo.src = C.fundo;
                fundo.style.left = C.fundoX + 'px';
                fundo.style.top = C.fundoY + 'px';
            }
            document.documentElement.style.setProperty('--foto-borda', C.foto.borda + 'px');
            document.documentElement.style.setProperty('--foto-borda-cor', C.foto.bordaCor);

            const itens = [];
            steps.forEach((s) => { if (s.type === 'pagina') { itens.push(criarPagina(s.artistas, midia)); } });
            return itens;
        }

        function aoCarregar() {
            clearTimeout(loadWatchdog);
            try {
                const sessoes = lerSessoes(loader);
                const selecao = Fea.selecionar(sessoes, agoraMs(), {
                    anoEvento: C.anoEvento, offsetMin: C.fuso, duracaoPadraoMin: C.duracaoPadraoMin, esgotadoValor: C.esgotadoValor,
                    modalidades: C.modalidades, maxModalidades: C.maxModalidades, limiteGrande: C.limiteGrande
                });
                const steps = Fea.buildSteps(selecao, T, C.itensPorPagina);
                log('registros', sessoes.length, 'artistas', selecao.artistas.length, 'sessoes', selecao.sessoes,
                    'descartados', selecao.descartados, 'excedentes', selecao.excedentes,
                    'steps', steps.map((s) => s.type).join('>'));
                if (!steps.length) { semConteudo('sem sessao hoje'); return; }

                globalWatchdog = setTimeout(() => encerrar('watchdog global', 0),
                    Fea.totalMs(steps) + 2 * T.carregarMidia + T.margemGlobal);
                preparar(steps).then((itens) => {
                    if (finalizado) { return; }
                    stage.classList.remove('opacity-0');
                    stage.classList.add('opacity-100');
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

        // Sem filtro no servidor: o cliente interpreta data/horario e remove sessoes ja encerradas.
        loader.addData(C.dataset, false, 'amount=0', '', C.basePath);
        loader.nodataiserror = false;
        loader.autoloaded = false;
        loadWatchdog = setTimeout(() => semConteudo('timeout do loader'), T.carregarDados);
        loader.load(aoCarregar, () => { clearTimeout(loadWatchdog); semConteudo('falha no load'); });
    }

    window.addEventListener('load', () => {
        const ajustar = () => {
            const s = Math.min(window.innerWidth / LARGURA, window.innerHeight / 512);
            $('stage').style.transform = 'scale(' + s + ')';
        };
        ajustar();
        window.addEventListener('resize', ajustar);
        ebhtml.create2({}, iniciar);
    });
})();
