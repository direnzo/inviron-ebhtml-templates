/**
 * layout-engine.js - regras de layout responsivo por perfil
 */
(function() {
    var currentProfile = 'default';

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
            if (legalText) {
                legalText.style.flexBasis = blocks.legal + '%';
            }
        }

        if (title) {
            title.style.textAlign = getProfileValue(cfg.layout.titleAlign, profile, 'center');
        }

        if (legalText) {
            legalText.style.opacity = String(getProfileValue(cfg.layout.legal.opacity, profile, 0.7));
            legalText.style.fontSize = String(getProfileValue(cfg.layout.legal.fontSize, profile, '36%'));
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

    window.ArmazemSeuJeitoLayoutEngine = {
        applyLayoutConfig: applyLayoutConfig,
        getProfileValue: getProfileValue,
        getViewportProfile: getViewportProfile,
        getCurrentProfile: function() {
            return currentProfile;
        }
    };
})();
