// ===== ANIMAÇÃO DE INTRO BRACKET-AREA (zoom + alternância de canto) =====
// Zoom reverso: começa em scale 1, termina em scale 2 nos 30% finais do tempo
function animarZoomOutBracketArea(restanteMs) {
    var area = document.querySelector('.bracket-area');
    if (!area) {
        console.log('[animarZoomOutBracketArea] .bracket-area NÃO encontrada');
        return;
    }
    var ORIGINS = ['top left', 'bottom left', 'top right', 'bottom right'];
    var idx = parseInt(localStorage.getItem('bracket_intro_origin_idx'), 10);
    if (isNaN(idx) || idx < 0 || idx > 3) idx = 0;
    var origin = ORIGINS[idx];
    localStorage.setItem('bracket_intro_origin_idx', (idx + 1) % 4);

    var zoomDelay = Math.round(restanteMs * 0.7);
    var zoomDur   = Math.max(Math.round(restanteMs * 0.3), 300); // mínimo 300ms

    console.log('[animarZoomOutBracketArea] INICIO', {
        restanteMs: restanteMs,
        zoomDelay: zoomDelay,
        zoomDur: zoomDur,
        origin: origin,
        area: area
    });

    area.style.transition = 'none';
    area.style.transformOrigin = origin;
    area.style.transform = 'scale(1)';
    void area.offsetWidth;
    setTimeout(function() {
        console.log('[animarZoomOutBracketArea] INICIANDO ZOOM', {
            transition: 'transform ' + (zoomDur/1000) + 's cubic-bezier(0.77,0,0.175,1), transform-origin ' + (zoomDur/1000) + 's cubic-bezier(0.77,0,0.175,1)',
            origin: origin
        });
        area.style.transition = 'transform ' + (zoomDur/1000) + 's cubic-bezier(0.77,0,0.175,1), transform-origin ' + (zoomDur/1000) + 's cubic-bezier(0.77,0,0.175,1)';
        area.style.transformOrigin = origin;
        area.style.transform = 'scale(2)';
    }, zoomDelay);
    setTimeout(function() {
        console.log('[animarZoomOutBracketArea] RESETANDO estilos');
        area.style.transition = '';
        area.style.transform = '';
        area.style.transformOrigin = '';
    }, zoomDelay + zoomDur + 80);
}
// ═══════════════════════════════════════════════════════
//  caminhos_futebol — master.js
//  Copa FIFA 2026 | Bracket Pathways | ES5
// ═══════════════════════════════════════════════════════

// ──────────────────────────────────────────────────
//  MAPEAMENTO: "FASE_POSICAO" → ID do elemento DOM
//
//  Copa 2026 — 48 seleções, fase de grupos 3ª (12 grupos)
//  2ª Rodada (R32): 16 partidas  → 8 no lado esq, 8 no dir
//  Oitavas   (R16):  8 partidas  → 4 no lado esq, 4 no dir
//  Quartas   (QF):   4 partidas  → 2 no lado esq, 2 no dir
//  Semifinal (SF):   2 partidas  → 1 no lado esq, 1 no dir
//  Final    (FINAL): 1 partida   → centro
//  Bronze  (BRONZE): 1 partida   → centro
// ──────────────────────────────────────────────────
var SLOT_MAP = {
    'R32_1':    'm-r32-l1',
    'R32_2':    'm-r32-l2',
    'R32_3':    'm-r32-l3',
    'R32_4':    'm-r32-l4',
    'R32_5':    'm-r32-l5',
    'R32_6':    'm-r32-l6',
    'R32_7':    'm-r32-l7',
    'R32_8':    'm-r32-l8',
    'R32_9':    'm-r32-r1',
    'R32_10':   'm-r32-r2',
    'R32_11':   'm-r32-r3',
    'R32_12':   'm-r32-r4',
    'R32_13':   'm-r32-r5',
    'R32_14':   'm-r32-r6',
    'R32_15':   'm-r32-r7',
    'R32_16':   'm-r32-r8',
    'R16_1':    'm-r16-l1',
    'R16_2':    'm-r16-l2',
    'R16_3':    'm-r16-l3',
    'R16_4':    'm-r16-l4',
    'R16_5':    'm-r16-r1',
    'R16_6':    'm-r16-r2',
    'R16_7':    'm-r16-r3',
    'R16_8':    'm-r16-r4',
    'QF_1':     'm-qf-l1',
    'QF_2':     'm-qf-l2',
    'QF_3':     'm-qf-r1',
    'QF_4':     'm-qf-r2',
    'SF_1':     'm-sf-l',
    'SF_2':     'm-sf-r',
    'FINAL_1':  'm-final',
    'BRONZE_1': 'm-bronze'
};

// Prioridade de fase para localizar a mais avançada
var FASE_PRIORIDADE = {
    'FINAL':  6,
    'BRONZE': 5,
    'SF':     4,
    'QF':     3,
    'R16':    2,
    'R32':    1
};

// Fases em ordem sequencial para lógica de ocultamento
// QF, SF, Final e Bronze NUNCA são ocultadas — sempre visíveis
var FASES_COLS = [
    { fase: 'R32', total: 16, colIds: ['col-r32-l', 'col-r32-r'] },
    { fase: 'R16', total: 8,  colIds: ['col-r16-l', 'col-r16-r'] }
];

// ──────────────────────────────────────────────────
//  CONFIG — 3 cores primarias do template (header/footer)
//  Altere apenas estes 3 valores HEX para customizar o visual
// ──────────────────────────────────────────────────
var CONFIG = {
    corDestaque: '#FBBF24',  // cor de destaque (bordas, destaques)
    corEscura:   '#006400',  // cor de fundo (paineis, gradientes)
    corClara:    '#FFFFFF'   // cor de texto e bordas
};

function hexToRgba(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

function aplicarCores(cfg) {
    var s = document.documentElement.style;
    s.setProperty('--cor-destaque',     cfg.corDestaque);
    s.setProperty('--cor-fundo-painel', hexToRgba(cfg.corEscura, 0.90));
    s.setProperty('--cor-borda',        hexToRgba(cfg.corClara,  0.30));
    s.setProperty('--cor-texto',        cfg.corClara);
}

/* Mescla cores do D_SPD (TEXTO7/TEXTO8/TEXTO9) com defaults do CONFIG
   Suporta objeto plano (mock: spd.TEXTO7) ou item EdgeContents (spd.value()) */
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

// ──────────────────────────────────────────────────
//  ENTRY POINT
// ──────────────────────────────────────────────────
window.onload = function() {
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var mockLoader = {
            loaded:   function() { console.log('[Mock] loaded'); },
            finished: function() { console.log('[Mock] finished'); }
        };
        var dfJson = MOCK_DATA.D_FOOTBALL && MOCK_DATA.D_FOOTBALL.TEXTO3;
        var partidas;
        try { partidas = JSON.parse(dfJson || '[]'); } catch (e) { partidas = []; }
        var dados = processarDadosMock(partidas);
        var spdSponsor = MOCK_DATA.D_SPD || null;
        var mockConfig = {
            duration: (MOCK_DATA.config && MOCK_DATA.config.duration) || 30000,
            sponsor: spdSponsor ? {
                frase: spdSponsor.TEXT1       || '',
                logo:  spdSponsor.IMAGE_LOGO  || ''
            } : (MOCK_DATA.config && MOCK_DATA.config.sponsor) || null
        };
        aplicarCores(mergeColorsFromSpd(CONFIG, spdSponsor));
        iniciarTemplate(dados, mockConfig, mockLoader);
    } else {
        ebhtml.create2({}, function(loader) {
            loader.addData('D_FOOTBALL', false);
            loader.addData('D_SPD',      false);
            loader.autoloaded    = false;
            loader.nodataiserror = false;

            loader.load(function() {
                var dfReg = loader.data('D_FOOTBALL');
                if (!dfReg) {
                    console.error('[caminhos_futebol] Sem dados D_FOOTBALL');
                    loader.finished();
                    return;
                }
                var jsonStr = (dfReg.value('TEXTO3') && dfReg.value('TEXTO3').value) || '';
                if (!jsonStr) {
                    console.error('[caminhos_futebol] D_FOOTBALL.TEXTO3 vazio');
                    loader.finished();
                    return;
                }
                var partidas;
                try {
                    partidas = JSON.parse(jsonStr);
                } catch (e) {
                    console.error('[caminhos_futebol] Erro JSON.parse TEXTO3:', e);
                    loader.finished();
                    return;
                }

                // Extrai patrocinador e cores do D_SPD (CONFIG='1')
                var spdSponsor = null;
                var spdLista = loader.datalist('D_SPD');
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

                // Monta config com sponsor e duracao (compativel com aplicarSponsor)
                var runConfig = {
                    duration: 30000,
                    sponsor: spdSponsor ? {
                        frase: (spdSponsor.value('TEXT1')      && spdSponsor.value('TEXT1').value)      || '',
                        logo:  (spdSponsor.value('IMAGE_LOGO') && spdSponsor.value('IMAGE_LOGO').value) || ''
                    } : null
                };

                aplicarCores(mergeColorsFromSpd(CONFIG, spdSponsor));
                var dados = processarDadosMock(partidas);
                iniciarTemplate(dados, runConfig, loader);
            });
        });
    }
};

// ──────────────────────────────────────────────────
//  PROCESSAR DADOS — array de partidas (mock e producao)
// ──────────────────────────────────────────────────
function processarDadosMock(partidas) {
    var dados = {};
    for (var i = 0; i < partidas.length; i++) {
        var p     = partidas[i];
        var fase  = p.CATEGORY  || '';
        var pos   = p.SUBTITULO || '';
        var chave = fase + '_' + pos;
        dados[chave] = {
            fase:          fase,
            posicao:       parseInt(pos, 10),
            timeCasa:      p.TITULO     || '',
            timeVisitante: p.TITULO2    || '',
            flagCasa:      p.FOTO       || '',
            flagVisitante: p.FOTO2      || '',
            golsCasa:      p.TEXTO      || '',
            golsVisitante: p.TEXTO2     || '',
            status:        p.SUBTITULO3 || 'NS',
            datahora:      p.SUBTITULO2 || ''
        };
    }
    return dados;
}

// ──────────────────────────────────────────────────
//  INICIAR TEMPLATE
// ──────────────────────────────────────────────────

// ===== Helpers para intro de patrocinador (copiado do placar_futebol) =====
function normalizarUrlMidia(url) {
    if (!url) { return url; }
    url = url.trim();
    if (url.indexOf('file:///') === 0 || url.indexOf('file://') === 0) {
        var partes = url.replace(/\\/g, '/').split('/');
        var nomeArquivo = partes[partes.length - 1];
        var mId = nomeArquivo.match(/^f_(\d+)\./);
        if (mId) {
            return window.location.protocol + '//127.0.0.1:13199/FILES/' + mId[1];
        }
        return window.location.protocol + '//127.0.0.1:13199/FILES/' + nomeArquivo;
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
    introEl.innerHTML = '';
    introEl.style.opacity = '1';
    introEl.classList.remove('hidden');
    if (isVideo) {
        var vid = document.createElement('video');
        vid.className = 'w-full h-full object-cover';
        vid.setAttribute('playsinline', '');
        vid.muted = true;
        introEl.appendChild(vid);
        var _introDone = false;
        var _introTimer = null;
        function _onIntroDone() {
            if (_introDone) { return; }
            _introDone = true;
            clearTimeout(_introTimer);
            onDone();
        }
        _introTimer = setTimeout(function() {
            vid.pause();
            _onIntroDone();
        }, 5000);
        vid.addEventListener('ended', _onIntroDone);
        vid.addEventListener('error', _onIntroDone);
        vid.addEventListener('canplay', function onFirstCanPlay() {
            vid.removeEventListener('canplay', onFirstCanPlay);
            var p = vid.play();
            if (p && typeof p.then === 'function') {
                p.then(function() {}, function() { _onIntroDone(); });
            }
        });
        vid.src = url;
        vid.load();
    } else {
        var img = document.createElement('img');
        img.className = 'w-full h-full object-cover';
        img.onload = function() { setTimeout(onDone, 5000); };
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

// ====== INICIAR TEMPLATE COM INTRO E TEMPO TOTAL DE 10s ======
var DURACAO_TOTAL = 10000; // ms
var INTRO_MAX_MS = 5000;   // ms

function iniciarTemplate(dados, config, loader) {
    var sponsor = config && config.sponsor;
    var introUrl = sponsor && sponsor.intro ? sponsor.intro : (sponsor && sponsor.FILE_IMAGE1 ? sponsor.FILE_IMAGE1 : null);
    if (!introUrl && sponsor && sponsor.logo && sponsor.logo.indexOf('.mp4') !== -1) {
        introUrl = sponsor.logo;
    }
    if (!introUrl && typeof MOCK_DATA !== 'undefined' && MOCK_DATA.D_SPD && MOCK_DATA.D_SPD.FILE_IMAGE1) {
        introUrl = MOCK_DATA.D_SPD.FILE_IMAGE1;
    }
    if (introUrl) {
        var introStart = Date.now();
        mostrarIntro(introUrl, function() {
            var introMs = Math.min(Date.now() - introStart, INTRO_MAX_MS);
            esconderIntro(function() {
                iniciarTemplateSemIntro(dados, config, loader, introMs);
            });
        });
    } else {
        iniciarTemplateSemIntro(dados, config, loader, 0);
    }
}

function iniciarTemplateSemIntro(dados, config, loader, introMs) {
    renderizarBracket(dados);
    marcarBrasil();
    marcarCampeao(dados);
    ocultarFasesAnteriores(dados);
    atualizarFaseAtual(dados);
    aplicarSponsor(config);

    // Detecta se a fase mais avançada exibida é R32 ou R16
    var faseMaisAlta = null;
    for (var k in dados) {
        if (dados.hasOwnProperty(k)) {
            var f = k.split('_')[0];
            if (!faseMaisAlta || (FASE_PRIORIDADE[f] && FASE_PRIORIDADE[f] > (FASE_PRIORIDADE[faseMaisAlta]||0))) {
                faseMaisAlta = f;
            }
        }
    }
    console.log('[iniciarTemplateSemIntro] faseMaisAlta:', faseMaisAlta);
    if (faseMaisAlta === 'R32' || faseMaisAlta === 'R16') {
        var restante = Math.max(DURACAO_TOTAL - (introMs || 0), 1000);
        // Espera a animação de entrada dos brackets (700ms), depois aplica o zoom reverso
        setTimeout(function() {
            console.log('[iniciarTemplateSemIntro] Chamando animarZoomOutBracketArea, restante:', restante - 700);
            animarZoomOutBracketArea(restante - 700);
        }, 700);
    }

    animarEntradaBracket();
    destacarPartidaRecente(dados);
    animarCaminhoVencedor(dados);

    setTimeout(function() {
        BracketDraw.init();
        BracketDraw.animarLinhas(0);
    }, 80);

    var wrapper = document.getElementById('main-wrapper');
    if (wrapper) {
        wrapper.style.opacity = '1';
    }

    loader.loaded();
    var restante = Math.max(DURACAO_TOTAL - (introMs || 0), 1000);
    setTimeout(function() {
        loader.finished();
    }, restante);
}

// ──────────────────────────────────────────────────
//  DESTAQUE BRASIL
//  Marca qualquer card que contenha "Brasil" (casa ou visitante)
// ──────────────────────────────────────────────────
function marcarBrasil() {
    var cards = document.querySelectorAll('.match-card');
    for (var i = 0; i < cards.length; i++) {
        var linhas = cards[i].querySelectorAll('.team-row');
        for (var j = 0; j < linhas.length; j++) {
            var span = linhas[j].querySelector('.tname');
            if (span && span.textContent.toLowerCase().indexOf('brasil') !== -1) {
                if (cards[i].className.indexOf('match-brasil') === -1) {
                    cards[i].className = cards[i].className + ' match-brasil';
                }
                if (linhas[j].className.indexOf('brasil-row') === -1) {
                    linhas[j].className = linhas[j].className + ' brasil-row';
                }
            }
        }
    }
}

// ──────────────────────────────────────────────────
//  DESTAQUE CAMPEÃO
//  Se a Final tiver resultado, destaca o time vencedor
// ──────────────────────────────────────────────────
function marcarCampeao(dados) {
    var final = dados['FINAL_1'];
    if (!final || !final.golsCasa || !final.golsVisitante) return;

    var gcasa = parseInt(final.golsCasa, 10);
    var gvis  = parseInt(final.golsVisitante, 10);
    if (isNaN(gcasa) || isNaN(gvis) || gcasa === gvis) return;

    var card = document.getElementById('m-final');
    if (!card) return;

    var linhas = card.querySelectorAll('.team-row');
    var linhaVencedor = (gcasa > gvis) ? linhas[0] : linhas[1];

    if (card.className.indexOf('match-campeao') === -1) {
        card.className = card.className + ' match-campeao';
    }
    if (linhaVencedor && linhaVencedor.className.indexOf('campeao-row') === -1) {
        linhaVencedor.className = linhaVencedor.className + ' campeao-row';
    }
}

// ──────────────────────────────────────────────────
//  OCULTAR FASES ANTERIORES
//  Quando uma fase tem todos os times definidos,
//  as colunas das fases anteriores são ocultadas.
//  Ex: se R16 está completo → oculta colunas R32.
// ──────────────────────────────────────────────────
function isFaseCompleta(dados, fase, total) {
    for (var i = 1; i <= total; i++) {
        var p = dados[fase + '_' + i];
        if (!p) { return false; }
        var s = p.status || '';
        if (s !== 'FT' && s !== 'AET' && s !== 'PEN') { return false; }
    }
    return true;
}

function ocultarFasesAnteriores(dados) {
    // Encontra a fase mais avançada com TODOS os times definidos
    var latestCompleto = -1;
    for (var i = 0; i < FASES_COLS.length; i++) {
        var f = FASES_COLS[i];
        if (isFaseCompleta(dados, f.fase, f.total)) {
            latestCompleto = i;
        } else {
            break; // Fases são sequenciais
        }
    }

    // Oculta todas as fases ATÉ a mais avançada completa (inclusive)
    for (var k = 0; k <= latestCompleto; k++) {
        var ids = FASES_COLS[k].colIds;
        for (var m = 0; m < ids.length; m++) {
            var col = document.getElementById(ids[m]);
            if (col) col.style.display = 'none';
        }
    }

    // Redesenha conectores SVG se alguma coluna foi ocultada
    if (latestCompleto > 0) {
        BracketDraw.init();
    }
}

// ──────────────────────────────────────────────────
//  PATROCINADOR
// ──────────────────────────────────────────────────
function aplicarSponsor(config) {
    var sponsor = config && config.sponsor;
    if (!sponsor) return;

    var footerEl = document.getElementById('sponsorFooter');
    var fraseEl  = document.getElementById('sponsorFrase');
    var logoEl   = document.getElementById('sponsorLogo');

    if (fraseEl && sponsor.frase) { fraseEl.textContent = sponsor.frase; }
    if (logoEl  && sponsor.logo)  { logoEl.src = sponsor.logo; }

    // Exibe o footer quando houver frase ou logo
    if (footerEl && (sponsor.frase || sponsor.logo)) {
        footerEl.classList.remove('hidden');
        footerEl.classList.add('flex');
    }
}

// ──────────────────────────────────────────────────
//  RENDERIZAR TODOS OS SLOTS
// ──────────────────────────────────────────────────
function renderizarBracket(dados) {
    for (var chave in SLOT_MAP) {
        if (!SLOT_MAP.hasOwnProperty(chave)) continue;
        var slotId  = SLOT_MAP[chave];
        var partida = dados[chave] || null;
        renderizarCard(slotId, partida);
    }
}

// ──────────────────────────────────────────────────
//  RENDERIZAR CARD INDIVIDUAL
// ──────────────────────────────────────────────────
function renderizarCard(slotId, partida) {
    var card = document.getElementById(slotId);
    if (!card) return;

    // Preenche data/hora no .match-slot pai
    var slot = card.parentNode;
    if (slot) {
        var dateEl = slot.querySelector('.match-date');
        if (dateEl) dateEl.textContent = (partida && partida.datahora) ? partida.datahora : '';
    }

    var linhas = card.querySelectorAll('.team-row');
    if (!linhas || linhas.length < 2) return;

    var linhaCasa      = linhas[0];
    var linhaVisitante = linhas[1];

    // Sem dados → exibe "a definir"
    if (!partida || !partida.timeCasa) {
        preencherLinha(linhaCasa,      '', '', '');
        preencherLinha(linhaVisitante, '', '', '');
        return;
    }

    // Preenche time da casa (linha 0)
    preencherLinha(linhaCasa, partida.timeCasa, partida.flagCasa, partida.golsCasa);

    // Preenche visitante (linha 1)
    preencherLinha(linhaVisitante, partida.timeVisitante, partida.flagVisitante, partida.golsVisitante);

    // Aplica destaque de vencedor/perdedor se jogo encerrado
    if (partida.status === 'FT' || partida.status === 'AET' || partida.status === 'PEN') {
        aplicarResultado(card, partida);
    }
}

function preencherLinha(linha, nome, flagUrl, gols) {
    var imgFlag   = linha.querySelector('.flag');
    var spanNome  = linha.querySelector('.tname');
    var spanScore = linha.querySelector('.score');

    var nomeValido = nome && nome !== 'TBD';

    if (imgFlag) {
        if (flagUrl && nomeValido) {
            imgFlag.src          = flagUrl;
            imgFlag.alt          = nome;
            imgFlag.style.display = '';
        } else {
            imgFlag.style.display = 'none';
        }
    }

    if (spanNome) {
        if (nomeValido) {
            spanNome.textContent = nome;
            spanNome.className   = spanNome.className.replace(/\s*tname-indef/g, '');
        } else {
            spanNome.textContent = 'a definir';
            if (spanNome.className.indexOf('tname-indef') === -1) {
                spanNome.className = spanNome.className + ' tname-indef';
            }
        }
    }

    if (spanScore) spanScore.textContent = (gols !== '' && gols !== undefined && gols !== null) ? gols : '';
}

function aplicarResultado(card, partida) {
    var gcasa = parseInt(partida.golsCasa,      10);
    var gvis  = parseInt(partida.golsVisitante, 10);

    var linhas = card.querySelectorAll('.team-row');
    var linhaCasa      = linhas[0];
    var linhaVisitante = linhas[1];

    if (isNaN(gcasa) || isNaN(gvis)) return;

    if (gcasa > gvis) {
        linhaCasa.className      = linhaCasa.className      + ' winner';
        linhaVisitante.className = linhaVisitante.className + ' loser';
    } else if (gvis > gcasa) {
        linhaVisitante.className = linhaVisitante.className + ' winner';
        linhaCasa.className      = linhaCasa.className      + ' loser';
    }
    // Empate sem destaque (aguardando prorrogação/pênaltis)
}

// ──────────────────────────────────────────────────
//  ATUALIZAR LABEL DE FASE ATUAL
// ──────────────────────────────────────────────────
function atualizarFaseAtual(dados) {
    var melhorPrioridade = 0;
    var melhorFase       = '';

    for (var chave in dados) {
        if (!dados.hasOwnProperty(chave)) continue;
        var p = dados[chave];
        var status = p.status;
        // Considera como "fase ativa" se jogo ao vivo ou encerrado
        if (status === 'NS' || status === 'TBD') continue;
        var prio = FASE_PRIORIDADE[p.fase] || 0;
        if (prio > melhorPrioridade) {
            melhorPrioridade = prio;
            melhorFase       = p.fase;
        }
    }

    var labels = {
        'R32':    '2ª Rodada',
        'R16':    'Oitavas de Final',
        'QF':     'Quartas de Final',
        'SF':     'Semifinal',
        'FINAL':  'Grande Final',
        'BRONZE': 'Disputa de 3º Lugar'
    };

    var el = document.getElementById('header-fase');
    if (el && melhorFase) {
        el.textContent = labels[melhorFase] || melhorFase;
    }
}

// ──────────────────────────────────────────────────
//  ANIMAÇÃO: ENTRADA COM STAGGER (fora→dentro)
//  R32 aparece primeiro em pares L+R, Final por último
// ──────────────────────────────────────────────────
var STAGGER_ORDER = [
    'm-r32-l1', 'm-r32-r1', 'm-r32-l2', 'm-r32-r2',
    'm-r32-l3', 'm-r32-r3', 'm-r32-l4', 'm-r32-r4',
    'm-r32-l5', 'm-r32-r5', 'm-r32-l6', 'm-r32-r6',
    'm-r32-l7', 'm-r32-r7', 'm-r32-l8', 'm-r32-r8',
    'm-r16-l1', 'm-r16-r1', 'm-r16-l2', 'm-r16-r2',
    'm-r16-l3', 'm-r16-r3', 'm-r16-l4', 'm-r16-r4',
    'm-qf-l1',  'm-qf-r1',  'm-qf-l2',  'm-qf-r2',
    'm-sf-l',   'm-sf-r',
    'm-bronze', 'm-final'
];

function animarEntradaBracket() {
    // 1. Labels: cascata rápida (incluindo gold/bronze com escala)
    animarLabels();
    // 2. Cards: stagger existente
    for (var i = 0; i < STAGGER_ORDER.length; i++) {
        animarCardComDelay(STAGGER_ORDER[i], i * 60);
    }
    // 3. Linhas SVG: gerenciadas pelo setTimeout em iniciarTemplate (após reflow)
    //    BracketDraw.animarLinhas(0) chamado lá junto com init()
}

function animarLabelComDelay(el, delay) {
    setTimeout(function() {
        el.style.opacity   = '1';
        el.style.transform = 'scale(1)';
    }, delay);
}

function animarLabels() {
    var labels = document.querySelectorAll('.round-label');
    for (var i = 0; i < labels.length; i++) {
        labels[i].style.opacity    = '0';
        labels[i].style.transition = 'opacity 0.4s ease';
    }
    // Gold e Bronze: efeito de escala extra para destacar
    var especiais = document.querySelectorAll('.round-label--gold, .round-label--bronze');
    for (var k = 0; k < especiais.length; k++) {
        especiais[k].style.transform  = 'scale(0.6)';
        especiais[k].style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
    }
    for (var j = 0; j < labels.length; j++) {
        animarLabelComDelay(labels[j], j * 80);
    }
}

function animarCardComDelay(id, delay) {
    var card = document.getElementById(id);
    if (!card) return;
    card.style.opacity   = '0';
    card.style.transform = 'translateY(-8px)';
    card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

    setTimeout(function() {
        card.style.opacity   = '1';
        card.style.transform = 'translateY(0)';
    }, delay);
}

// ──────────────────────────────────────────────────
//  DESTAQUE: PARTIDA MAIS RECENTE COM RESULTADO
// ──────────────────────────────────────────────────
function destacarPartidaRecente(dados) {
    var melhorPrioridade = -1;
    var melhorChave      = '';
    var statusAtivos     = { '1H': 1, 'HT': 1, '2H': 1, 'ET': 1, 'BT': 1, 'P': 1, 'FT': 1, 'AET': 1, 'PEN': 1 };

    for (var chave in dados) {
        if (!dados.hasOwnProperty(chave)) continue;
        var p = dados[chave];
        if (!statusAtivos[p.status]) continue;
        var prio = FASE_PRIORIDADE[p.fase] || 0;
        if (prio > melhorPrioridade) {
            melhorPrioridade = prio;
            melhorChave      = chave;
        }
    }

    if (!melhorChave) return;

    var slotId = SLOT_MAP[melhorChave];
    if (!slotId) return;

    var card = document.getElementById(slotId);
    if (!card) return;

    card.className = card.className + ' match-highlight';
}

// ──────────────────────────────────────────────────
//  CAMINHO DO VENCEDOR (winner-path glow)
// ──────────────────────────────────────────────────
function animarCaminhoVencedor(dados) {
    for (var chave in dados) {
        if (!dados.hasOwnProperty(chave)) continue;
        var p      = dados[chave];
        var status = p.status;

        // Só aplica em jogos encerrados
        if (status !== 'FT' && status !== 'AET' && status !== 'PEN') continue;

        var gcasa = parseInt(p.golsCasa,      10);
        var gvis  = parseInt(p.golsVisitante, 10);
        if (isNaN(gcasa) || isNaN(gvis)) continue;

        // Se há um vencedor claro, realça o card no caminho
        if (gcasa !== gvis) {
            var slotId = SLOT_MAP[chave];
            if (!slotId) continue;
            var card = document.getElementById(slotId);
            if (card) {
                card.className = card.className + ' winner-path';
            }
        }
    }
}
