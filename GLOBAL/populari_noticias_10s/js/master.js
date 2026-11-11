(function (root) {
    'use strict';

    function createCycle(loader, timing, clock, onPhase) {
        var started = false;
        var loaded = false;
        var done = false;
        var handles = [];
        var origin = 0;

        function markLoaded() {
            if (!loaded) {
                loaded = true;
                loader.loaded();
            }
        }

        function finish(empty) {
            var index;
            if (done) { return; }
            done = true;
            for (index = 0; index < handles.length; index++) {
                clock.clearTimeout(handles[index]);
            }
            if (empty) { onPhase('empty'); }
            markLoaded();
            loader.finished();
        }

        function phase(name) {
            if (done) { return; }
            try {
                onPhase(name);
            } catch (error) {
                finish(true);
            }
        }

        function at(delay, action) {
            handles.push(clock.setTimeout(action, Math.max(0, delay - (clock.now() - origin))));
        }

        return {
            start: function () {
                if (done || started) { return; }
                started = true;
                origin = clock.now();
                phase('news');
                if (done) { return; }
                markLoaded();
                at(timing.textOut, function () { phase('text-out'); });
                at(timing.outro, function () { phase('outro'); });
                at(timing.fadeOut, function () { phase('fade-out'); });
                at(timing.total, function () { finish(false); });
            },
            skip: function () { finish(true); },
            ended: function () { return done; },
            started: function () { return started; }
        };
    }

    function readField(item, names) {
        var index;
        var node;
        if (!item) { return ''; }
        for (index = 0; index < names.length; index++) {
            node = item.value(names[index]);
            if (node && node.value !== undefined && node.value !== null && String(node.value) !== '') {
                return String(node.value);
            }
        }
        return '';
    }

    function readCompleteText(item, dataset) {
        var names = (dataset.fullTextFields || []).concat(dataset.textFields);
        var index;
        var value;
        for (index = 0; index < names.length; index++) {
            value = readField(item, [names[index]]).replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
            if (value) { return value; }
        }
        return '';
    }

    function boot() {
        var config = root.CONFIG;
        var doc = root.document;
        var body = doc.body;
        var stage = doc.getElementById('stage');
        var photo = doc.getElementById('foto');
        var photoImage = doc.getElementById('foto-img');
        var text = doc.getElementById('texto');
        var textBox = doc.getElementById('texto-wrap');
        var brandLogo = doc.getElementById('brand-logo');
        var cycle;
        var dataTimer;
        var imageTimer;
        var fontTimer;
        var logoTimer;
        var logoRequest;
        var resizeTimer;
        var acceptingData = true;
        var imageSettled = false;
        var logoReady = false;
        var contentReady = false;
        var currentPhase = 'empty';
        var clock = {
            now: function () { return +new Date(); },
            setTimeout: function (action, delay) { return root.setTimeout(action, delay); },
            clearTimeout: function (handle) { root.clearTimeout(handle); }
        };

        function setPhase(name) {
            currentPhase = name;
            body.className = 'populari-body phase-' + name;
        }

        function aplicarConfigVisual() {
            var width = root.innerWidth || doc.documentElement.clientWidth;
            var height = root.innerHeight || doc.documentElement.clientHeight;
            var shortSide = Math.min(width, height);
            var border = Math.max(1, Math.round(shortSide * config.layout.borderScale));
            var inset = config.layout.safeInset + '%';
            var frame = doc.getElementById('moldura');
            var frameBase = doc.getElementById('moldura-base');
            var logo = doc.getElementById('logo');
            var brand = doc.getElementById('brand');
            var news = doc.getElementById('noticia');
            body.style.fontSize = (shortSide * config.layout.baseScale) + 'px';
            brandLogo.style.width = config.layout.brandWidthPercent + '%';
            brandLogo.style.height = (width * config.layout.brandWidthPercent / 100 *
                config.assets.brandHeight / config.assets.brandWidth /
                (shortSide * config.layout.baseScale)) + 'em';
            body.style.backgroundColor = config.colors.background;
            body.style.color = config.colors.text;
            brand.style.backgroundColor = config.colors.opening;
            frame.style.borderColor = config.colors.brand;
            frame.style.borderWidth = border + 'px';
            frameBase.style.borderColor = config.colors.text;
            frameBase.style.borderWidth = border + 'px';
            textBox.style.left = inset;
            textBox.style.right = inset;
            textBox.style.bottom = inset;
            text.style.right = config.layout.fitSafety + 'px';
            text.style.bottom = config.layout.fitSafety + 'px';
            logo.style.top = inset;
            logo.style.right = inset;
            news.style.webkitTransitionDuration = config.timing.transition + 'ms';
            news.style.transitionDuration = config.timing.transition + 'ms';
            textBox.style.webkitTransitionDuration = (config.timing.outro - config.timing.textOut) + 'ms';
            textBox.style.transitionDuration = (config.timing.outro - config.timing.textOut) + 'ms';
            brand.style.webkitTransitionDuration = config.timing.transition + 'ms';
            brand.style.transitionDuration = config.timing.transition + 'ms';
            stage.style.webkitTransitionDuration = (config.timing.total - config.timing.fadeOut) + 'ms';
            stage.style.transitionDuration = (config.timing.total - config.timing.fadeOut) + 'ms';
        }

        function fitText() {
            var minimum = config.layout.textMin;
            var maximum = config.layout.textMax;
            var best = minimum;
            var attempt;
            var size;
            var range = doc.createRange();
            var safety = config.layout.fitSafety;

            function fits() {
                var bounds;
                var box = textBox.getBoundingClientRect();
                range.selectNodeContents(text);
                bounds = range.getBoundingClientRect();
                return bounds.width <= box.width - safety && bounds.height <= box.height - safety &&
                    bounds.left >= box.left && bounds.right <= box.right &&
                    bounds.top >= box.top + safety && bounds.bottom <= box.bottom;
            }

            text.style.fontSize = minimum + 'em';
            if (!fits()) {
                textBox.setAttribute('data-fit', 'failed');
                if (root.console && root.console.warn) {
                    root.console.warn('Populari: texto excede a area no tamanho minimo; revisar legibilidade.');
                }
                return;
            }
            for (attempt = 0; attempt < config.layout.fitSteps; attempt++) {
                size = (minimum + maximum) / 2;
                text.style.fontSize = size + 'em';
                if (fits()) {
                    best = size;
                    minimum = size;
                } else {
                    maximum = size;
                }
            }
            text.style.fontSize = best + 'em';
            textBox.setAttribute('data-fit', 'ok');
        }

        function skip() {
            acceptingData = false;
            root.clearTimeout(dataTimer);
            root.clearTimeout(imageTimer);
            root.clearTimeout(fontTimer);
            root.clearTimeout(logoTimer);
            if (cycle) { cycle.skip(); }
            if (logoRequest && logoRequest.readyState !== 4) { logoRequest.abort(); }
        }

        function loadBrandLogo() {
            var settled = false;

            function complete(svg) {
                if (settled || cycle.ended()) { return; }
                settled = true;
                root.clearTimeout(logoTimer);
                try {
                    if (!svg || (svg.localName || svg.nodeName).toLowerCase() !== 'svg') {
                        skip();
                        return;
                    }
                    var inline = doc.importNode(svg, true);
                    inline.setAttribute('width', '100%');
                    inline.setAttribute('height', '100%');
                    inline.setAttribute('aria-hidden', 'true');
                    brandLogo.appendChild(inline);
                    logoReady = true;
                    if (contentReady) { cycle.start(); }
                } catch (error) { skip(); }
            }

            try {
                logoRequest = new root.XMLHttpRequest();
                logoRequest.onreadystatechange = function () {
                    if (logoRequest.readyState !== 4 || settled || cycle.ended()) { return; }
                    try {
                        if (logoRequest.status !== 200) { complete(null); return; }
                        var xml = logoRequest.responseXML;
                        if (!xml || !xml.documentElement) {
                            xml = new root.DOMParser().parseFromString(logoRequest.responseText, 'image/svg+xml');
                        }
                        complete(xml.documentElement);
                    } catch (error) { complete(null); }
                };
                logoRequest.onerror = function () { complete(null); };
                logoTimer = root.setTimeout(function () { complete(null); }, config.timing.logoTimeout);
                logoRequest.open('GET', config.assets.brandLogo, true);
                logoRequest.send(null);
            } catch (error) { skip(); }
        }

        function prepare(data) {
            var headline = String(data.text || '').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
            if (!headline) { skip(); return; }
            if ('textContent' in text) { text.textContent = headline; } else { text.innerText = headline; }

            function fontsReady(origin) {
                if (cycle.ended()) { return; }
                try {
                    if (doc.fonts && doc.fonts.status !== 'loaded') {
                        if (clock.now() - origin < config.timing.fontTimeout) {
                            fontTimer = root.setTimeout(function () { fontsReady(origin); }, config.timing.fontPoll);
                            return;
                        }
                        text.style.fontFamily = 'Arial, sans-serif';
                    }
                    fitText();
                    contentReady = true;
                    if (logoReady) { cycle.start(); }
                } catch (error) { skip(); }
            }

            function imageReady(success) {
                if (imageSettled || cycle.ended()) { return; }
                imageSettled = true;
                root.clearTimeout(imageTimer);
                try {
                    if (success) {
                        photo.style.backgroundImage = 'url("' + String(data.photo).replace(/["\\\r\n]/g, '\\$&') + '")';
                    }
                    photo.setAttribute('data-image', success ? 'ready' : 'fallback');
                    fontsReady(clock.now());
                } catch (error) {
                    skip();
                }
            }

            photoImage.onload = function () { imageReady(true); };
            photoImage.onerror = function () { imageReady(false); };
            imageTimer = root.setTimeout(function () { imageReady(false); }, config.timing.imageTimeout);
            if (data.photo) {
                photoImage.src = data.photo;
                if (photoImage.complete && photoImage.naturalWidth > 0) { imageReady(true); }
            } else {
                imageReady(false);
            }
        }

        function connect(loader) {
            cycle = createCycle(loader, config.timing, clock, setPhase);
            dataTimer = root.setTimeout(skip, config.timing.dataTimeout);
            loader.autoloaded = false;
            loader.nodataiserror = false;
            try {
                loadBrandLogo();
                if (cycle.ended()) { return; }
                loader.addData(config.dataset.name, false, config.dataset.parameters);
                loader.load(function () {
                    if (!acceptingData || cycle.ended()) { return; }
                    acceptingData = false;
                    root.clearTimeout(dataTimer);
                    try {
                        var item = loader.data(config.dataset.name);
                        if (!item) { skip(); return; }
                        prepare({
                            text: readCompleteText(item, config.dataset),
                            photo: readField(item, config.dataset.imageFields)
                        });
                    } catch (error) {
                        skip();
                    }
                }, function () {
                    if (acceptingData) { skip(); }
                });
            } catch (error) {
                skip();
            }
        }

        aplicarConfigVisual();
        root.onresize = function () {
            root.clearTimeout(resizeTimer);
            resizeTimer = root.setTimeout(function () {
                if (cycle && cycle.ended()) { return; }
                try {
                    aplicarConfigVisual();
                    if (currentPhase !== 'empty') { fitText(); }
                } catch (error) { skip(); }
            }, config.layout.resizeDelay);
        };
        root.ebhtml.create2({}, connect);
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            createCycle: createCycle, readField: readField,
            readCompleteText: readCompleteText, boot: boot
        };
    } else {
        root.onload = boot;
    }
}(typeof window !== 'undefined' ? window : this));