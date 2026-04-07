/**
 * PRECO PRISMATURISMO - Template de preco de combustivel (320x320px)
 * Dados:
 *   D_COMBUSTIVEL - TITULO, PRECO (decimal), LOCAL
 *   D_LOCAL       - ID do local fisico (tela)
 *   D_LOGO        - FOTO1 (bandeira), FOTO2 (posto), LOCAL (fk para D_LOCAL.ID)
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
    duration: 10000  /* ms que o template fica visivel antes de chamar finished() */
};

/* =============================================================
   INICIALIZACAO
   ============================================================= */

window.onload = function() {
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
        var mockLoader = {
            data: function(key) {
                var ds = MOCK_DATA.datasets[key];
                if (!ds) return null;
                /* Array = datalist mock; usa indice sequencial para D_COMBUSTIVEL */
                if (Array.isArray(ds)) {
                    var idx = (typeof MOCK_DATA.currentIndex !== 'undefined') ? MOCK_DATA.currentIndex % ds.length : 0;
                    var item = ds[idx];
                    return ds.length ? { value: function(c) { return item[c] !== undefined ? { value: item[c] } : null; } } : null;
                }
                return ds;
            },
            datalist: function(key) {
                var ds = MOCK_DATA.datasets[key];
                if (!ds) return null;
                var arr = Array.isArray(ds) ? ds : [ds];
                return {
                    count: function() { return arr.length; },
                    get: function(i) {
                        return { value: function(c) { return arr[i] && arr[i][c] !== undefined ? { value: arr[i][c] } : null; } };
                    }
                };
            },
            loaded:   function() { console.log('[PRECO] Mock loaded'); },
            finished: function() {
                var combustiveis = MOCK_DATA.datasets['D_COMBUSTIVEL'];
                if (Array.isArray(combustiveis)) { MOCK_DATA.advanceIndex(combustiveis.length); }
                console.log('[PRECO] Mock finished');
            }
        };
        inicializarTemplate(mockLoader);
    } else {
        ebhtml.create2({}, function(loader) {
            loader.addData('D_COMBUSTIVEL', false);
            loader.addData('D_LOCAL', false);
            loader.addData('D_LOGO', false);
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
    var localData   = loader.data('D_LOCAL');
    var logoList    = loader.datalist('D_LOGO');

    renderizarLogos(localData, logoList);

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
    var precoRs    = document.getElementById('preco-rs');
    var precoValor = document.getElementById('preco-valor');
    var footer     = document.getElementById('footer');

    /* 1. R$ entra da esquerda */
    setTimeout(function() {
        precoRs.classList.remove('opacity-0');
        precoRs.classList.add('animate-fade-left');
    }, 200);

    /* 2. Numero punch-in; pulse inicia apos o punch terminar (650ms) */
    setTimeout(function() {
        precoValor.classList.remove('opacity-0');
        precoValor.classList.add('animate-punch-in');
        setTimeout(function() {
            precoValor.classList.remove('animate-punch-in');
            precoValor.classList.add('animate-price-pulse');
        }, 650);
    }, 350);

    /* 3. Footer sobe de baixo */
    setTimeout(function() {
        footer.classList.remove('opacity-0');
        footer.classList.add('animate-slide-up');
    }, 500);
}

/* =============================================================
   LOGOS (D_LOGO filtrado por D_LOCAL.ID)
   D_LOCAL fornece o ID do local; percorre D_LOGO para encontrar
   o item cujo campo LOCAL bate com esse ID.
   FOTO1 = bandeira da distribuidora, FOTO2 = logo do posto.
   ============================================================= */

function renderizarLogos(localData, logoList) {
    var imgBandeira = document.getElementById('img-bandeira');
    var imgPosto    = document.getElementById('img-posto');

    var localId  = localData ? obterCampo(localData, 'ID', '') : '';
    var logoItem = null;

    if (logoList && typeof logoList.count === 'function') {
        for (var i = 0; i < logoList.count(); i++) {
            var item = logoList.get(i);
            if (obterCampo(item, 'LOCAL', '') == localId) {
                logoItem = item;
                break;
            }
        }
    }

    var urlBandeira = logoItem ? obterCampo(logoItem, 'FOTO1', '') : '';
    var urlPosto    = logoItem ? obterCampo(logoItem, 'FOTO2', '') : '';

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
    /* TITULO ex: 'Etanol Comum', 'Gasolina', 'Diesel S10' */
    var titulo  = obterCampo(combustivel, 'TITULO', 'Combustivel');
    var partes  = titulo.split(' ');
    var nome    = partes[0];
    var subtipo = partes.length > 1 ? partes.slice(1).join(' ') : '';

    /* Preco vem com ponto decimal (4.39) -> converte para virgula (4,39) */
    var preco = obterCampo(combustivel, 'PRECO', '0,00').replace('.', ',');

    document.getElementById('preco-valor').innerText         = preco;
    document.getElementById('combustivel-nome').innerText    = nome.toUpperCase();
    document.getElementById('combustivel-subtipo').innerText = subtipo.toUpperCase();

    /* Cor: tenta TITULO inteiro (ex: 'ETANOL COMUM'), fallback para 1a palavra */
    var chave = titulo.toUpperCase();
    var cor   = CORES_COMBUSTIVEL[chave]
             || CORES_COMBUSTIVEL[nome.toUpperCase()]
             || CORES_COMBUSTIVEL['DEFAULT'];
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
