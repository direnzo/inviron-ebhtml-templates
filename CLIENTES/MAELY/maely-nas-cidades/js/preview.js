function extranetView() {
    window.onload = function () {
        var parentRef = null;
        var previewData = null;
        var app = window.MAELYNewsApp;

        aplicarConfigVisual();

        try {
            parentRef = window.parent;
        } catch (e) {
            parentRef = null;
        }
        if (!parentRef || !app || typeof app.renderNews !== 'function') { return; }

        try {
            if (typeof parentRef.getTemplatePreviewData === 'function') {
                previewData = parentRef.getTemplatePreviewData();
            }
        } catch (e1) {
            previewData = null;
        }

        if (!previewData) {
            try {
                previewData = parentRef.templatePreviewData || parentRef.TEMPLATE_PREVIEW_DATA || null;
            } catch (e2) {
                previewData = null;
            }
        }

        if (!previewData) { return; }

        app.renderNews(previewData, function (success, reason) {
            if (!success && CONFIG.debug) {
                console.log('[MAELY preview] noticia indisponivel: ' + reason);
            }
        });
    };
}