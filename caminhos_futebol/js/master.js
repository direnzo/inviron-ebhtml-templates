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
        var reg    = lista.get(i);
        var fase   = reg.value('FASE').value   || '';
        var pos    = reg.value('POSICAO').value || '';
        var chave  = fase + '_' + pos;
        dados[chave] = {
            fase:             fase,
            posicao:          parseInt(pos, 10),
            timeCasa:         reg.value('TIME_CASA').value        || '',
            timeVisitante:    reg.value('TIME_VISITANTE').value   || '',
            flagCasa:         reg.value('FLAG_CASA').value        || '',
            flagVisitante:    reg.value('FLAG_VISITANTE').value   || '',
            golsCasa:         reg.value('GOLS_CASA').value        || '',
            golsVisitante:    reg.value('GOLS_VISITANTE').value   || '',
            status:           reg.value('STATUS').value           || 'NS'
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
        var chave = p.FASE + '_' + p.POSICAO;
        dados[chave] = {
            fase:          p.FASE,
            posicao:       parseInt(p.POSICAO, 10),
            timeCasa:      p.TIME_CASA       || '',
            timeVisitante: p.TIME_VISITANTE  || '',
            flagCasa:      p.FLAG_CASA       || '',
            flagVisitante: p.FLAG_VISITANTE  || '',
            golsCasa:      p.GOLS_CASA       || '',
            golsVisitante: p.GOLS_VISITANTE  || '',
            status:        p.STATUS          || 'NS'
        };
    }
    return dados;
}

// ──────────────────────────────────────────────────
//  INICIAR TEMPLATE
// ──────────────────────────────────────────────────
function iniciarTemplate(dados, config, loader) {
    renderizarBracket(dados);
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

    var linhas = card.querySelectorAll('.team-row');
    if (!linhas || linhas.length < 2) return;

    var linhaCasa      = linhas[0];
    var linhaVisitante = linhas[1];

    // Sem dados → mantém "TBD"
    if (!partida || !partida.timeCasa) return;

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
    var imgFlag = linha.querySelector('.flag');
    var spanNome  = linha.querySelector('.tname');
    var spanScore = linha.querySelector('.score');

    if (imgFlag) {
        if (flagUrl) {
            imgFlag.src = flagUrl;
            imgFlag.alt = nome;
        } else {
            imgFlag.style.display = 'none';
        }
    }
    if (spanNome)  spanNome.textContent  = nome  || 'TBD';
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
    for (var i = 0; i < STAGGER_ORDER.length; i++) {
        animarCardComDelay(STAGGER_ORDER[i], i * 60);
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
