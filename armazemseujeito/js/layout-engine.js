/**
 * @file layout-engine.js
 * Aplica configurações de layout responsivo ao DOM com base no aspect ratio da viewport.
 * Chamado pelo runtime-engine no carregamento e a cada resize de janela.
 * Não acessa dados de produto — só manipula estrutura/classes CSS dos blocos.
 * @namespace ArmazemSeuJeitoLayoutEngine
 */
(function() {
    var currentProfile = 'default';

    /**
     * Detecta o perfil de layout com base no aspect ratio atual da viewport.
     * Limiares: portrait ≤ 3:4 | default = 3:4 a 4:3 | landscape ≥ 4:3 | ultrawide ≥ 3:1.
     * @returns {'portrait'|'landscape'|'ultrawide'|'default'} Perfil detectado.
     */
    function getViewportProfile() {
        var ratio = window.innerWidth / window.innerHeight;
        if (ratio >= 3) {
            return 'ultrawide';
        }
        if (ratio >= (4 / 3)) {
            return 'landscape';
        }
        if (ratio <= (3 / 4)) {
            return 'portrait';
        }
        return 'default';
    }

    /**
     * Lê um valor de um mapa de configuração por perfil, com duplo fallback.
     * @param {Object} map      - Mapa com chaves por perfil (default, portrait, landscape...).
     * @param {string} profile  - Perfil atual da viewport.
     * @param {*}      fallback - Valor de último recurso se map for nulo ou vazio.
     * @returns {*} Valor do perfil, ou do 'default', ou do fallback.
     */
    function getProfileValue(map, profile, fallback) {
        if (!map) {
            return fallback;
        }
        if (map[profile] !== undefined && map[profile] !== null) {
            return map[profile];
        }
        if (map.default !== undefined && map.default !== null) {
            return map.default;
        }
        return fallback;
    }

    /**
     * Aplica ao DOM todas as regras de layout para o perfil atual da viewport.
     * Ajusta: topo da safe area, flex-direction, flex-basis dos blocos,
     * alinhamento do título, opacidade/tamanho do texto legal e borda da coluna.
     * @param {Object} cfg - Referência a TEMPLATE_CONFIG (global).
     * @returns {'portrait'|'landscape'|'ultrawide'|'default'} Perfil aplicado.
     */
    function applyLayoutConfig(cfg) {
        var profile = getViewportProfile();
        currentProfile = profile;

        var fullContent = document.getElementById('fullContent');
        var split = document.getElementById('content_split');
        var infoColumn = document.getElementById('info_column');
        var imgContainer = document.getElementById('img_container');
        var titleContainer = document.getElementById('title_container');
        var priceDisplay = document.getElementById('price_display');
        var legalText = document.getElementById('legal_text');
        var title = document.getElementById('title');

        if (fullContent) {
            fullContent.style.top = getProfileValue(cfg.layout.safeAreaTop, profile, '34vh');
            fullContent.setAttribute('data-layout-profile', profile);
        }

        if (split) {
            var sideBySide = !!getProfileValue(cfg.layout.sideBySide, profile, false);
            if (sideBySide) {
                split.classList.add('flex-row');
                split.classList.remove('flex-col');
            } else {
                split.classList.add('flex-col');
                split.classList.remove('flex-row');
            }
        }

        var blocks = getProfileValue(cfg.layout.blocks, profile, cfg.layout.blocks.default || null);
        if (blocks) {
            if (imgContainer) {
                imgContainer.style.flexBasis = blocks.image + '%';
            }
            if (titleContainer) {
                titleContainer.style.flexBasis = blocks.title + '%';
            }
            if (priceDisplay) {
                priceDisplay.style.flexBasis = blocks.price + '%';
            }
        }

        if (title) {
            title.style.textAlign = getProfileValue(cfg.layout.titleAlign, profile, 'center');
        }

        if (infoColumn) {
            if (profile === 'landscape' || profile === 'ultrawide') {
                infoColumn.classList.add('border-l');
                infoColumn.classList.remove('border-t');
            } else {
                infoColumn.classList.add('border-t');
                infoColumn.classList.remove('border-l');
            }
        }

        return profile;
    }

    /** API pública do layout engine. Consumida por runtime-engine.js. */
    window.ArmazemSeuJeitoLayoutEngine = {
        applyLayoutConfig: applyLayoutConfig,
        getProfileValue: getProfileValue,
        getViewportProfile: getViewportProfile,
        getCurrentProfile: function() {
            return currentProfile;
        }
    };
})();
