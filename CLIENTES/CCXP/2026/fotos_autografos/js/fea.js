/**
 * CCXP26 - logica pura de Fotos e Autografos (sem DOM, sem EBHTML).
 * ESQUELETO (fase 0): a logica entra na fase 1.
 */
(function (root) {
    'use strict';

    const api = {};

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    } else {
        root.Fea = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
