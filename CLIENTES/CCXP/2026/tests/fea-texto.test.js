const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../fotos_autografos/js/master.js'), 'utf8');
const functions = source.slice(source.indexOf('    function topoDaLinha('), source.indexOf('    function cabe('));

for (const scenario of ['sucesso', 'http', 'invalido', 'timeout']) {
    test('carregamento do selo SVG: ' + scenario, async () => {
        const warnings = [];
        const svg = { localName: 'svg', namespaceURI: 'http://www.w3.org/2000/svg' };
        let requested;
        class Xhr {
            open(method, url) { requested = url; }
            send() {
                if (scenario === 'timeout') { this.ontimeout(); return; }
                this.status = scenario === 'http' ? 404 : 200;
                this.responseText = 'svg';
                this.onload();
            }
        }
        const context = {
            C: { selo: { svg: 'img/selo.svg' } }, T: { carregarMidia: 6000 },
            XMLHttpRequest: Xhr,
            DOMParser: class { parseFromString() { return { documentElement: svg, querySelector: () => scenario === 'invalido' }; } },
            document: { importNode: (node) => node },
            console: { warn: (...args) => warnings.push(args) }
        };
        vm.createContext(context);
        vm.runInContext(source.slice(source.indexOf('    function carregarSelo('), source.indexOf('    function carregarFonte(')), context);
        const result = await context.carregarSelo();
        assert.equal(requested, 'img/selo.svg');
        assert.equal(result, scenario === 'sucesso' ? svg : null);
        assert.equal(warnings.length, scenario === 'sucesso' ? 0 : 1);
    });
}

for (const useSvg of [true, false]) {
    test('selo em sessões esgotadas: ' + (useSvg ? 'clones SVG' : 'fallback PNG'), () => {
        const configSource = fs.readFileSync(path.join(__dirname, '../fotos_autografos/js/config.js'), 'utf8');
        const C = vm.runInNewContext(configSource + '\nCONFIG');
        C.debug = false;
        const elements = [];
        const makeElement = (tag) => {
            const el = { tag, style: { setProperty() {} }, classList: { add() {} }, appendChild() {},
                setAttribute: function (name, value) { this[name] = value; } };
            elements.push(el);
            return el;
        };
        const svg = { cloneNode: () => makeElement('svg') };
        const context = {
            C, FOTO_AUSENTE: '#000', SELO_RAZAO: 22 / 103,
            criar: () => makeElement('div'), document: { createElement: makeElement },
            ajustarTitulo: () => {}, linha: () => {}, extremoDireito: () => {}
        };
        vm.createContext(context);
        vm.runInContext(source.slice(source.indexOf('    function criarBloco('), source.indexOf('    /** Pagina =')), context);
        const sessoes = [true, false, true].map((esgotado) => ({ rotulo: 'Foto', horario: '12:00', esgotado }));
        context.criarBloco({ nome: 'Artista', variante: 'grande', sessoes }, 0, { [C.selo.svg]: useSvg ? svg : null }, {}, false);
        const selos = elements.filter((el) => el.class === 'selo absolute');
        assert.equal(selos.length, 2);
        selos.forEach((selo) => {
            assert.equal(selo.tag, useSvg ? 'svg' : 'img');
            assert.equal(selo.src, useSvg ? undefined : C.selo.img);
            assert.equal(selo.style.transform, 'rotate(' + C.selo.rotacao + 'deg)');
        });
    });
}

test('duas colunas mantêm margens equilibradas e limites iguais nas duas variantes', () => {
    const configSource = fs.readFileSync(path.join(__dirname, '../fotos_autografos/js/config.js'), 'utf8');
    const blockSource = source.slice(source.indexOf('    function criarBloco('), source.indexOf('    /** Pagina ='));
    const C = vm.runInNewContext(configSource + '\nCONFIG');
    C.debug = false;
    for (const variante of ['grande', 'compacta']) {
        const elements = [];
        const context = {
            C, FOTO_AUSENTE: '#000', SELO_RAZAO: 22 / 103,
            criar: (classe) => {
                const el = { className: classe, style: { setProperty() {} }, classList: { add() {} }, appendChild() {} };
                elements.push(el);
                return el;
            },
            document: { createElement: () => ({ style: {}, classList: { add() {} }, appendChild() {} }) },
            ajustarTitulo: (el, texto, cfg) => { el.style.left = cfg.x; el.style.width = cfg.largura; },
            linha: (el, x, baseline, size, width, minimum) => { el.x = x; el.width = width; el.minimum = minimum; },
            extremoDireito: () => { throw new Error('centralização inesperada'); }
        };
        vm.createContext(context);
        vm.runInContext(blockSource, context);
        const artista = { nome: 'Artista', variante, sessoes: [{ rotulo: 'Foto', horario: 'das 12:00 às 15:00' }] };
        context.criarBloco(artista, 0, {}, {}, false);
        context.criarBloco(artista, 1, {}, {}, false);
        const labels = elements.filter((el) => el.className.startsWith('rotulo '));
        const times = elements.filter((el) => el.className.startsWith('horario '));
        const titles = elements.filter((el) => el.className.startsWith('titulo-artista '));
        assert.equal(labels[0].minimum, 1, 'rótulo deve usar autofit sem corte');
        assert.equal(labels[1].minimum, 1, 'rótulo deve usar autofit sem corte');
        assert.equal(labels[0].width, times[0].width);
        assert.equal(labels[1].width, times[1].width);
        assert.equal(labels[1].x - labels[0].x, times[1].x - times[0].x);
        const rightEdge = Math.max(labels[1].x + labels[1].width, times[1].x + times[1].width);
        assert.ok(Math.abs(titles[0].style.left - (1280 - rightEdge)) < 2);
    }
});

for (const scale of [1, 0.6, 1.5]) {
    for (const width of [120, 240.4, 800, 50000]) {
        test('horario integral: largura ' + width + ', escala ' + scale, () => {
            const original = '09H00 - 19H30 (horario integral recebido)';
            const element = { style: {}, textContent: original };
            const context = {
                LARGURA: 1280, CONTEUDO: 1.174, ASC: 0.952,
                $: () => ({ getBoundingClientRect: () => ({ width: 1280 * scale }) }),
                document: {
                    createRange: () => ({
                        selectNodeContents() {},
                        getBoundingClientRect: () => ({
                            width: width * Math.max(1, parseFloat(element.style.fontSize)) / 40 * scale
                        })
                    })
                }
            };
            vm.createContext(context);
            vm.runInContext(functions, context);
            context.linha(element, 20, 200, 40, 240, 1);
            const transform = element.style.transform;
            const compression = transform.startsWith('scaleX(') ? parseFloat(transform.slice(7)) : 1;
            const rendered = width * Math.max(1, parseFloat(element.style.fontSize)) / 40 * compression;
            assert.ok(rendered <= 239.00001, 'largura final: ' + rendered);
            assert.equal(element.style.overflow, 'visible');
            assert.equal(element.style.textOverflow, 'clip');
            assert.equal(element.style.maxWidth, 'none');
            assert.equal(element.textContent, original);
        });
    }
}