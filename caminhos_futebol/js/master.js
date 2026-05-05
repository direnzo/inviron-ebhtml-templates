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
//  ENTRY POINT
// ──────────────────────────────────────────────────
window.onload = function() {
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var mockLoader = {
            loaded:   function() { console.log('[Mock] loaded'); },
            finished: function() { console.log('[Mock] finished'); }
        };
        var dados = processarDadosMock(MOCK_DATA.partidas);
        iniciarTemplate(dados, MOCK_DATA.config, mockLoader);
    } else {
        ebhtml.create2({}, function(loader) {
            loader.addData('D_COPA', false);
            loader.autoloaded    = false;
            loader.nodataiserror = false;

            loader.load(function() {
                if (loader.datalist('D_COPA') === undefined || loader.datalist('D_COPA').count() === 0) {
                    console.error('[caminhos_futebol] Sem dados D_COPA');
                    loader.finished();
                    return;
                }
                var dados = processarDados(loader);
                iniciarTemplate(dados, { duration: 30000 }, loader);
            });
        });
    }
};

// ──────────────────────────────────────────────────
//  PROCESSAR DADOS — EdgeContents (datalist)
// ──────────────────────────────────────────────────
function processarDados(loader) {
    var lista  = loader.datalist('D_COPA');
    var total  = lista.count();
    var dados  = {};
    for (var i = 0; i < total; i++) {
        var reg   = lista.get(i);
        var fase  = reg.value('CATEGORY').value    || '';
        var pos   = reg.value('SUBTITULO').value   || '';
        var chave = fase + '_' + pos;
        dados[chave] = {
            fase:          fase,
            posicao:       parseInt(pos, 10),
            timeCasa:      reg.value('TITULO').value      || '',
            timeVisitante: reg.value('TITULO2').value     || '',
            flagCasa:      reg.value('FOTO').value        || '',
            flagVisitante: reg.value('FOTO2').value       || '',
            golsCasa:      reg.value('TEXTO').value       || '',
            golsVisitante: reg.value('TEXTO2').value      || '',
            status:        reg.value('SUBTITULO3').value  || 'NS',
            datahora:      reg.value('SUBTITULO2').value  || ''
        };
    }
    return dados;
}

// ──────────────────────────────────────────────────
//  PROCESSAR DADOS — Mock (array direto)
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
function iniciarTemplate(dados, config, loader) {
    renderizarBracket(dados);
    marcarBrasil();
    marcarCampeao(dados);
    BracketDraw.init();
    ocultarFasesAnteriores(dados);
    atualizarFaseAtual(dados);
    aplicarSponsor(config);
    animarEntradaBracket();
    destacarPartidaRecente(dados);
    animarCaminhoVencedor(dados);

    // Fade-in do wrapper
    var wrapper = document.getElementById('main-wrapper');
    if (wrapper) {
        wrapper.style.opacity = '1';
    }

    loader.loaded();

    setTimeout(function() {
        loader.finished();
    }, config.duration || 30000);
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
        if (!p || !p.timeCasa || p.timeCasa === 'TBD' ||
            !p.timeVisitante || p.timeVisitante === 'TBD') {
            return false;
        }
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

    var fraseEl = document.getElementById('sponsor-frase');
    var logoEl  = document.getElementById('sponsor-logo');

    if (fraseEl && sponsor.frase) { fraseEl.textContent = sponsor.frase; }
    if (logoEl  && sponsor.logo)  {
        logoEl.src = sponsor.logo;
        logoEl.style.display = 'block';
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
    // 3. Linhas SVG: simultâneas com os cards
    BracketDraw.animarLinhas(0);
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
