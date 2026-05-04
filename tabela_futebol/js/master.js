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

var LS_KEY_GRUPO = 'tabela_futebol_grupo_idx';
var DURACAO = 12000;

window.onload = function() {
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var mockLoader = {
            loaded: function() { console.log('[Mock] loaded'); },
            finished: function() { console.log('[Mock] finished'); }
        };

        var idx = parseInt(localStorage.getItem(LS_KEY_GRUPO), 10);
        if (isNaN(idx) || idx >= MOCK_DATA.grupos.length) { idx = 0; }

        var grupo = MOCK_DATA.grupos[idx];
        localStorage.setItem(LS_KEY_GRUPO, idx + 1);

        var duracao = (MOCK_DATA.config && MOCK_DATA.config.duration) || DURACAO;
        renderizarGrupo(grupo, mockLoader, duracao, MOCK_DATA.config);
    } else {
        ebhtml.create2({}, function(loader) {
            loader.addData('D_STANDINGS', false);
            loader.autoloaded = false;
            loader.nodataiserror = false;

            loader.load(function() {
                if (loader.data('D_STANDINGS') == undefined) {
                    console.error('ERRO: Sem dados D_STANDINGS');
                    loader.finished();
                    return;
                }

                var grupo = extrairGrupo(loader);
                renderizarGrupo(grupo, loader, DURACAO, null);
            });
        });
    }
};

function extrairGrupo(loader) {
    var item = loader.data('D_STANDINGS');
    var grupo = {
        nome: 'Grupo ' + (item.value('GRUPO') ? item.value('GRUPO').value : ''),
        times: []
    };

    var lista = loader.datalist('D_STANDINGS');
    for (var i = 0; i < lista.count(); i++) {
        var reg = lista.get(i);
        grupo.times.push({
            posicao: i + 1,
            nome: reg.value('TITULO') ? reg.value('TITULO').value : '',
            bandeira: reg.value('FOTO') ? reg.value('FOTO').value : '',
            pts: reg.value('PTS') ? reg.value('PTS').value : '0',
            pj: reg.value('PJ') ? reg.value('PJ').value : '0',
            vit: reg.value('VIT') ? reg.value('VIT').value : '0',
            emp: reg.value('EMP') ? reg.value('EMP').value : '0',
            der: reg.value('DER') ? reg.value('DER').value : '0',
            gm: reg.value('GM') ? reg.value('GM').value : '0',
            gc: reg.value('GC') ? reg.value('GC').value : '0',
            sg: reg.value('SG') ? reg.value('SG').value : '0'
        });
    }
    return grupo;
}

function renderizarGrupo(grupo, loader, duracao, config) {
    aplicarSponsor(config);

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
    loader.loaded();

    setTimeout(function() {
        loader.finished();
    }, duracao);
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

function aplicarSponsor(config) {    var sponsor = config && config.sponsor;
    if (!sponsor) { return; }

    var headerFrase = document.getElementById('headerFrase');
    var headerLogo  = document.getElementById('headerLogo');
    var footerFrase = document.getElementById('footerFrase');
    var footerLogo  = document.getElementById('footerLogo');

    if (headerFrase && sponsor.fraseHeader) { headerFrase.innerHTML = sponsor.fraseHeader; }
    if (headerLogo  && sponsor.logoHeader)  { headerLogo.src = sponsor.logoHeader; headerLogo.classList.remove('opacity-0'); }
    if (footerFrase && sponsor.fraseFooter) { footerFrase.innerHTML = sponsor.fraseFooter; }
    if (footerLogo  && sponsor.logoFooter)  { footerLogo.src = sponsor.logoFooter; footerLogo.classList.remove('opacity-0'); }
}
