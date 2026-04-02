/**
 * PRECO PRISMATURISMO - Template de preco de combustivel (320x320px)
 * Dados: D_COMBUSTIVEL (tipo, subtipo, preco) + D_LOCAL (logos)
 *
 * ATENCAO: ES5 obrigatorio - sem const/let/arrow functions/template strings
 */

/* =============================================================
   CONFIG: mapeamento de cores por tipo de combustivel.
   Adicione ou ajuste entradas conforme os tipos usados no posto.
   ============================================================= */
var CORES_COMBUSTIVEL = {
    'GASOLINA':           '#c0392b',
    'GASOLINA ADITIVADA': '#9b2335',
    'GASOLINA PREMIUM':   '#7b0a1e',
    'ETANOL':             '#16a34a',
    'ETANOL COMUM':       '#16a34a',
    'DIESEL':             '#d97706',
    'DIESEL S10':         '#b45309',
    'DIESEL ADITIVADO':   '#92400e',
    'GNV':                '#2563eb',
    'DEFAULT':            '#374151'
};

var CONFIG = {
    duration: 15000  /* ms que o template fica visivel antes de chamar finished() */
};

/* =============================================================
   INICIALIZACAO
   ============================================================= */

window.onload = function() {
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var mockLoader = {
            data:     function(key) { return MOCK_DATA.datasets[key] || null; },
            loaded:   function() { console.log('[PRECO] Mock loaded'); },
            finished: function() { console.log('[PRECO] Mock finished'); }
        };
        inicializarTemplate(mockLoader);
    } else {
        ebhtml.create2({}, function(loader) {
            loader.addData('D_COMBUSTIVEL', false);
            loader.addData('D_LOCAL', false);
            loader.autoloaded = false;
            loader.nodataiserror = false;

            loader.load(function() {
                inicializarTemplate(loader);
            });
        });
    }
};

/* =============================================================
   TEMPLATE PRINCIPAL
   ============================================================= */

function inicializarTemplate(loader) {
    var combustivel = loader.data('D_COMBUSTIVEL');
    var local       = loader.data('D_LOCAL');

    renderizarLogos(local);

    if (!combustivel) {
        console.error('[PRECO] Sem dados de D_COMBUSTIVEL');
        loader.finished();
        return;
    }

    renderizarPreco(combustivel);
    ativarAnimacoes();

    loader.loaded();

    setTimeout(function() {
        loader.finished();
    }, CONFIG.duration);
}

/* =============================================================
   ANIMACOES DE ENTRADA
   Dispara as classes CSS em sequencia escalonada
   ============================================================= */

function ativarAnimacoes() {
    var header     = document.getElementById('header');
    var precoRs    = document.getElementById('preco-rs');
    var precoValor = document.getElementById('preco-valor');
    var footer     = document.getElementById('footer');

    /* 1. Header desce do topo */
    header.classList.add('anim-slide-down');

    /* 2. R$ entra da esquerda */
    setTimeout(function() {
        precoRs.classList.add('anim-fade-left');
    }, 200);

    /* 3. Numero punch-in; pulse inicia apos o punch terminar (650ms) */
    setTimeout(function() {
        precoValor.classList.add('anim-punch-in');
        setTimeout(function() {
            precoValor.classList.remove('anim-punch-in');
            precoValor.classList.add('anim-pulse');
        }, 650);
    }, 350);

    /* 4. Footer sobe de baixo */
    setTimeout(function() {
        footer.classList.add('anim-slide-up');
    }, 500);
}

/* =============================================================
   LOGOS (D_LOCAL)
   Se a URL vier vazia o img fica oculto; o header nao quebra.
   ============================================================= */

function renderizarLogos(local) {
    var imgBandeira = document.getElementById('img-bandeira');
    var imgPosto    = document.getElementById('img-posto');

    var urlBandeira = local ? obterCampo(local, 'LOGO_BANDEIRA', '') : '';
    var urlPosto    = local ? obterCampo(local, 'LOGO_POSTO',    '') : '';

    if (urlBandeira) {
        imgBandeira.src = urlBandeira;
        imgBandeira.style.display = 'block';
    } else {
        imgBandeira.style.display = 'none';
    }

    if (urlPosto) {
        imgPosto.src = urlPosto;
        imgPosto.style.display = 'block';
    } else {
        imgPosto.style.display = 'none';
    }
}

/* =============================================================
   PRECO E COMBUSTIVEL (D_COMBUSTIVEL)
   ============================================================= */

function renderizarPreco(combustivel) {
    var nome    = obterCampo(combustivel, 'COMBUSTIVEL', 'COMBUSTIVEL');
    var subtipo = obterCampo(combustivel, 'SUBTIPO',     '');
    var preco   = obterCampo(combustivel, 'PRECO',       '0,00');

    document.getElementById('preco-valor').innerText         = preco;
    document.getElementById('combustivel-nome').innerText    = nome.toUpperCase();
    document.getElementById('combustivel-subtipo').innerText = subtipo.toUpperCase();

    /* Cor de fundo do rodape baseada no tipo de combustivel */
    var chave = nome.toUpperCase();
    var cor   = CORES_COMBUSTIVEL[chave] || CORES_COMBUSTIVEL['DEFAULT'];
    document.getElementById('footer').style.backgroundColor = cor;
}

/* =============================================================
   AUXILIAR: extrai campo de item EBHTML ou objeto mock
   ============================================================= */

function obterCampo(item, campo, valorPadrao) {
    try {
        if (!item) return valorPadrao;
        if (typeof item.value === 'function') {
            var val = item.value(campo);
            if (val && val.value !== undefined) return val.value;
        }
        if (item[campo] !== undefined) {
            return typeof item[campo].value !== 'undefined' ? item[campo].value : item[campo];
        }
        return valorPadrao;
    } catch (e) {
        return valorPadrao;
    }
}
