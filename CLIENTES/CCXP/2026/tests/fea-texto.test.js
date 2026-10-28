const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../fotos_autografos/js/master.js'), 'utf8');
const functions = source.slice(source.indexOf('    function topoDaLinha('), source.indexOf('    function cabe('));

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