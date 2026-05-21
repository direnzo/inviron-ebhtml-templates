/**
 * master.js - Tabela Copa 2026
 * ES5 obrigatorio - sem const/let/arrow/template-strings/Promise/fetch
 */

/* --- Injeta SVG inline via XHR (evita problema de img src em servidor local) --- */
function carregarSvgInline(containerEl, src) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', src, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return;
        if (xhr.status === 200 || xhr.status === 0) {
            var svgEl = containerEl.querySelector('svg');
            if (svgEl) svgEl.parentNode.removeChild(svgEl);
            containerEl.innerHTML = xhr.responseText;
            var svg = containerEl.querySelector('svg');
            if (svg) {
                svg.style.width  = '100%';
                svg.style.height = '100%';
                svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            }
        }
    };
    xhr.send();
    return xhr;
}

var LS_KEY_GRUPO   = 'tabela_futebol_grupo_idx';
var DURACAO        = 10000;
var INTRO_MAX_MS   = 5000;
var CONTENT_FILES_HOST = window.location.protocol + '//127.0.0.1:13199';

/* --- Configuracao de cores (sobrescreve CSS vars em :root) --- */
var CONFIG = {
    corDestaque: '#FBBF24',  // cor de destaque (hora, tempo, glow)
    corEscura:   '#006400',  // cor de fundo (painéis, gradientes) verde bem escuro 
    corClara:    '#FFFFFF'   // cor de texto e bordas
};

/* Converte HEX para rgba com opacidade */
function hexToRgba(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

function aplicarCores(cfg) {
    var s = document.documentElement.style;
    s.setProperty('--cor-destaque',           cfg.corDestaque);
    s.setProperty('--cor-destaque-glow',      hexToRgba(cfg.corDestaque, 0.10));
    s.setProperty('--cor-fundo-painel',       hexToRgba(cfg.corEscura,   0.90));
    s.setProperty('--cor-fundo-area',         hexToRgba(cfg.corDestaque, 0.15));
    s.setProperty('--cor-fundo-classificado', hexToRgba(cfg.corEscura,   0.55));
    s.setProperty('--cor-borda',              hexToRgba(cfg.corClara,    0.10));
    s.setProperty('--cor-texto',              cfg.corClara);
    s.setProperty('--cor-texto-sec',          hexToRgba(cfg.corClara,    0.50));
    s.setProperty('--cor-grad-from',          hexToRgba(cfg.corEscura,   0.90));
    s.setProperty('--cor-grad-mid',           hexToRgba(cfg.corEscura,   0.90));
    s.setProperty('--cor-grad-to',            hexToRgba(cfg.corEscura,   0.80));
}

/* --- Mescla cores do D_SPD (TEXTO7/TEXTO8/TEXTO9) com defaults do CONFIG --- */
function mergeColorsFromSpd(defaults, spd) {
    if (!spd) { return defaults; }
    var destaque = (spd.TEXTO7) || (spd.value && spd.value('TEXTO7') && spd.value('TEXTO7').value) || '';
    var escura   = (spd.TEXTO8) || (spd.value && spd.value('TEXTO8') && spd.value('TEXTO8').value) || '';
    var clara    = (spd.TEXTO9) || (spd.value && spd.value('TEXTO9') && spd.value('TEXTO9').value) || '';
    return {
        corDestaque: destaque || defaults.corDestaque,
        corEscura:   escura   || defaults.corEscura,
        corClara:    clara    || defaults.corClara
    };
}

/* --- Modo player (producao / mock local) --- */
function playerView() {
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var mockLoader = {
            loaded:   function() { console.log('[Mock] loaded'); },
            finished: function() { console.log('[Mock] finished'); }
        };

        var todosGruposMock = MOCK_DATA.D_FOOTBALL.TEXTO2.grupos;
        var idx = parseInt(localStorage.getItem(LS_KEY_GRUPO), 10);
        if (isNaN(idx) || idx >= todosGruposMock.length) { idx = 0; }

        var grupo = todosGruposMock[idx];
        localStorage.setItem(LS_KEY_GRUPO, idx + 1);

        var duracao    = (MOCK_DATA.config && MOCK_DATA.config.duration) || DURACAO;
        var spdSponsor = MOCK_DATA.D_SPD || null;

        aplicarCores(mergeColorsFromSpd(CONFIG, spdSponsor));
        renderizarGrupo(grupo, spdSponsor, mockLoader, duracao);
    } else {
        ebhtml.create2({}, function(loader) {
            loader.addData('D_FOOTBALL', false);
            loader.addData('D_SPD',      false);
            loader.autoloaded    = false;
            loader.nodataiserror = false;

            loader.load(function() {
                if (loader.data('D_FOOTBALL') == undefined) {
                    console.error('ERRO: Sem dados D_FOOTBALL');
                    loader.finished();
                    return;
                }

                // Le todos os grupos do campo TEXTO2 (JSON string)
                var texto2Str = loader.data('D_FOOTBALL').value('TEXTO2') ? loader.data('D_FOOTBALL').value('TEXTO2').value : '';
                var todosGrupos = [];
                try { todosGrupos = JSON.parse(texto2Str).grupos || []; } catch (e) { console.error('ERRO: JSON.parse TEXTO2', e); }

                if (todosGrupos.length === 0) {
                    console.error('ERRO: Nenhum grupo encontrado em TEXTO2');
                    loader.finished();
                    return;
                }

                var idx = parseInt(localStorage.getItem(LS_KEY_GRUPO), 10);
                if (isNaN(idx) || idx >= todosGrupos.length) { idx = 0; }
                var grupo = todosGrupos[idx];
                localStorage.setItem(LS_KEY_GRUPO, idx + 1);

                // Extrai patrocinador do D_SPD (CONFIG='1')
                var spdSponsor = null;
                var spdLista   = loader.datalist('D_SPD');
                if (spdLista) {
                    for (var i = 0; i < spdLista.count(); i++) {
                        var item = spdLista.get(i);
                        var cfgField = item.value && item.value('CONFIG');
                        if (cfgField && cfgField.value === '1') {
                            spdSponsor = item;
                            break;
                        }
                    }
                }

                aplicarCores(mergeColorsFromSpd(CONFIG, spdSponsor));
                renderizarGrupo(grupo, spdSponsor, loader, duracao);
            });
        });
    }
}

/* --- Renderiza grupo: tabela + jogos + sponsor + playlist --- */
function renderizarGrupo(grupo, spdSponsor, loader, duracao) {
    aplicarSponsor(spdSponsor);

    document.getElementById('grupoNome').innerHTML = grupo.nome;

    var container = document.getElementById('tabelaLinhas');
    var tmpl = document.getElementById('tmplLinha');
    container.innerHTML = '';

    for (var i = 0; i < grupo.times.length; i++) {
        var t = grupo.times[i];
        var frag = tmpl.content.cloneNode(true);
        var row = frag.firstElementChild;

        row.querySelector('[data-campo="posicao"]').textContent = t.posicao;
        row.querySelector('[data-campo="nome"]').textContent = t.nome;
        row.querySelector('[data-campo="pts"]').textContent = t.pts;
        row.querySelector('[data-campo="pj"]').textContent = t.pj;
        row.querySelector('[data-campo="vit"]').textContent = t.vit;
        row.querySelector('[data-campo="emp"]').textContent = t.emp;
        row.querySelector('[data-campo="der"]').textContent = t.der;
        row.querySelector('[data-campo="gm"]').textContent = t.gm;
        row.querySelector('[data-campo="gc"]').textContent = t.gc;
        row.querySelector('[data-campo="sg"]').textContent = t.sg;

        var bandEl = row.querySelector('[data-campo="bandeira"]');
        if (t.bandeira && bandEl) {
            carregarSvgInline(bandEl, t.bandeira);
        }

        if (i < 2) { row.classList.add('tabela-linha--classificado'); }
        row.style.animationDelay = ((i + 1) * 0.18) + 's';

        container.appendChild(frag);
    }

    document.getElementById('mainContent').style.opacity = '1';
    renderizarJogos(grupo.jogos || []);

    var introMedia = spdSponsor
        ? (spdSponsor.FILE_IMAGE1 || (spdSponsor.value && spdSponsor.value('FILE_IMAGE1') && spdSponsor.value('FILE_IMAGE1').value) || '')
        : '';

    if (introMedia) {
        var introStartTime = Date.now();
        mostrarIntro(introMedia, function() {
            var introActualMs = Math.min(Date.now() - introStartTime, INTRO_MAX_MS);
            esconderIntro(function() {
                loader.loaded();
                var tabelaMs = Math.max(duracao - introActualMs, 1000);
                setTimeout(function() {
                    loader.finished();
                }, tabelaMs);
            });
        });
    } else {
        loader.loaded();
        setTimeout(function() {
            loader.finished();
        }, duracao);
    }
}

function renderizarJogos(jogos) {
    var container = document.getElementById('jogosLinhas');
    var tmpl = document.getElementById('tmplJogo');
    container.innerHTML = '';

    if (!jogos || jogos.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:2vmin 0;color:rgba(255,255,255,0.3);font-size:60%">Jogos a confirmar</div>';
        return;
    }

    for (var i = 0; i < jogos.length; i++) {
        var j = jogos[i];
        var frag = tmpl.content.cloneNode(true);
        var row = frag.firstElementChild;

        row.querySelector('[data-campo="time1"]').textContent = j.time1;
        row.querySelector('[data-campo="time2"]').textContent = j.time2;
        row.querySelector('[data-campo="local"]').textContent = j.local || '';

        var b1 = row.querySelector('[data-campo="bandeira1"]');
        var b2 = row.querySelector('[data-campo="bandeira2"]');
        if (j.bandeira1 && b1) { carregarSvgInline(b1, j.bandeira1); }
        if (j.bandeira2 && b2) { carregarSvgInline(b2, j.bandeira2); }

        // Placar ou horario: se jogo aconteceu mostra gols, senao mostra data+hora
        var placarEl  = row.querySelector('[data-campo="placar"]');
        var horarioEl = row.querySelector('[data-campo="horario"]');
        var aoVivo = j.ao_vivo || jogoEstaAoVivo(j.data, j.hora);
        if (aoVivo) {
            var g1 = (j.gols1 !== null && j.gols2 !== null) ? j.gols1 : 0;
            var g2 = (j.gols1 !== null && j.gols2 !== null) ? j.gols2 : 0;
            placarEl.textContent = g1 + ' x ' + g2;
            horarioEl.innerHTML  = '<span class="ao-vivo-dot"></span><span class="ao-vivo-badge">AO VIVO</span>';
            row.classList.add('jogo-linha--ao-vivo');
        } else if (j.gols1 !== null && j.gols2 !== null) {
            placarEl.textContent  = j.gols1 + ' x ' + j.gols2;
            horarioEl.textContent = j.data || '';
        } else {
            placarEl.textContent  = j.hora || '-';
            horarioEl.textContent = j.data || '';
        }

        row.style.animationDelay = ((i + 1) * 0.12) + 's';
        container.appendChild(frag);
    }
}

/* Detecta se jogo esta acontecendo agora (dentro de 110 min apos inicio) */
function jogoEstaAoVivo(dataJogo, horaJogo) {
    if (!dataJogo || !horaJogo) return false;
    var agora = new Date();
    var partes = dataJogo.split('/');
    var horaParts = horaJogo.split(':');
    if (partes.length < 2 || horaParts.length < 2) return false;
    var dia  = parseInt(partes[0], 10);
    var mes  = parseInt(partes[1], 10) - 1;
    var hora = parseInt(horaParts[0], 10);
    var min  = parseInt(horaParts[1], 10);
    var inicio       = new Date(agora.getFullYear(), mes, dia, hora, min, 0);
    var fimEstimado  = new Date(inicio.getTime() + 110 * 60 * 1000);
    return agora >= inicio && agora <= fimEstimado;
}

function aplicarSponsor(spdSponsor) {
    var footerEl = document.getElementById('sponsorFooter');
    if (!footerEl) { return; }

    var frase = '';
    var logo  = '';
    if (spdSponsor) {
        // Suporta objeto plano (mock) ou item EdgeContents (value())
        frase = (spdSponsor.TEXT1)       || (spdSponsor.value && spdSponsor.value('TEXT1')       && spdSponsor.value('TEXT1').value)       || '';
        logo  = (spdSponsor.IMAGE_LOGO)  || (spdSponsor.value && spdSponsor.value('IMAGE_LOGO')  && spdSponsor.value('IMAGE_LOGO').value)  || '';
    }

    if (frase || logo) {
        footerEl.classList.remove('hidden');
        var fraseEl = document.getElementById('sponsorFrase');
        var logoEl  = document.getElementById('sponsorLogo');
        if (fraseEl) { fraseEl.innerHTML = frase; }
        if (logoEl && logo) {
            logoEl.src = logo;
            logoEl.classList.remove('hidden');
        }
    }
}

/* ====================================================
   HELPERS DE INTRO / MEDIA
   ==================================================== */

function normalizarUrlMidia(url) {
    if (!url) { return url; }
    url = url.trim();
    if (url.indexOf('file:///') === 0 || url.indexOf('file://') === 0) {
        var partes     = url.replace(/\\/g, '/').split('/');
        var nomeArquivo = partes[partes.length - 1];
        var mId = nomeArquivo.match(/^f_(\d+)\./);
        if (mId) { return CONTENT_FILES_HOST + '/FILES/' + mId[1]; }
        return CONTENT_FILES_HOST + '/FILES/' + nomeArquivo;
    }
    return url;
}

function isUrlVideo(url) {
    if (!url) { return false; }
    return /\.(mp4|webm|mov|avi|ogv|ogg)(\?.*)?$/i.test(url.trim());
}

function mostrarIntro(url, onDone) {
    var introEl = document.querySelector('#introScreen');
    if (!introEl) { onDone(); return; }

    var isVideo = isUrlVideo(url);
    url = normalizarUrlMidia(url);
    console.log('[tabela_futebol] intro (' + (isVideo ? 'video' : 'imagem') + '): ' + url);

    introEl.innerHTML = '';
    introEl.style.opacity = '1';
    introEl.classList.remove('hidden');

    if (isVideo) {
        var vid = document.createElement('video');
        vid.className = 'w-full h-full object-cover';
        vid.setAttribute('playsinline', '');
        vid.muted = true;
        introEl.appendChild(vid);

        var _introDone  = false;
        var _introTimer = null;
        function _onIntroDone() {
            if (_introDone) { return; }
            _introDone = true;
            clearTimeout(_introTimer);
            onDone();
        }
        _introTimer = setTimeout(function() {
            console.log('[intro-video] timeout ' + INTRO_MAX_MS + 'ms — cortando');
            vid.pause();
            _onIntroDone();
        }, INTRO_MAX_MS);

        vid.addEventListener('ended', function() { console.log('[intro-video] ended'); _onIntroDone(); });
        vid.addEventListener('error', function() {
            var code = vid.error ? vid.error.code : '?';
            console.error('[intro-video] error code=' + code);
            _onIntroDone();
        });

        vid.addEventListener('canplay', function onFirstCanPlay() {
            vid.removeEventListener('canplay', onFirstCanPlay);
            var p = vid.play();
            if (p && typeof p.then === 'function') {
                p.then(null, function(err) {
                    console.error('[intro-video] play() falhou:', err);
                    _onIntroDone();
                });
            }
        });

        vid.src = url;
        vid.load();
    } else {
        var img = document.createElement('img');
        img.className = 'w-full h-full object-cover';
        img.onload  = function() { setTimeout(onDone, INTRO_MAX_MS); };
        img.onerror = onDone;
        introEl.appendChild(img);
        img.src = url;
    }
}

function esconderIntro(onDone) {
    var introEl = document.querySelector('#introScreen');
    if (!introEl || introEl.classList.contains('hidden')) {
        if (onDone) { onDone(); }
        return;
    }
    introEl.style.opacity = '0';
    setTimeout(function() {
        introEl.classList.add('hidden');
        introEl.innerHTML = '';
        if (onDone) { onDone(); }
    }, 700);
}
