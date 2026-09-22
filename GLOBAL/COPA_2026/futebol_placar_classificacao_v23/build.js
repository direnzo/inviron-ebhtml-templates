/**
 * build.js — Pós-processa master.css para compatibilidade com browsers antigos
 * Remove @layer wrappers e converte oklch() para hex.
 * Uso: node build.js (executar DEPOIS do tailwindcss)
 */
var fs = require('fs');
var path = require('path');

var cssPath = path.join(__dirname, 'css', 'master.css');
var css = fs.readFileSync(cssPath, 'utf8');

// 1) Remove @layer wrappers (mantém conteúdo interno)
function stripLayers(src) {
    var result = '';
    var i = 0;
    while (i < src.length) {
        // Detecta @layer
        if (src.substr(i, 6) === '@layer') {
            // Avança até o primeiro '{'
            var braceStart = src.indexOf('{', i);
            if (braceStart === -1) break;
            // Extrai conteúdo interno equilibrando chaves
            var depth = 1;
            var j = braceStart + 1;
            while (j < src.length && depth > 0) {
                if (src[j] === '{') depth++;
                else if (src[j] === '}') depth--;
                j++;
            }
            // Conteúdo entre a primeira { e a última } correspondente
            var inner = src.substring(braceStart + 1, j - 1);
            result += inner;
            i = j;
        } else {
            result += src[i];
            i++;
        }
    }
    return result;
}

// 2) Converte oklch() para cores hex aproximadas
// Usa fallback simples para as cores padrão do Tailwind
var oklchMap = {
    'oklch(79.5% .184 86.047)': '#eab308',
    'oklch(26.6% .065 152.934)': '#052e16'
};

function replaceOklch(src) {
    // Substitui valores conhecidos
    Object.keys(oklchMap).forEach(function(key) {
        while (src.indexOf(key) !== -1) {
            src = src.replace(key, oklchMap[key]);
        }
    });
    // Remove quaisquer oklch restantes substituindo por transparent
    src = src.replace(/oklch\([^)]*\)/g, 'transparent');
    return src;
}

// 3) Remove @supports que testam features modernas e podem bloquear regras
function stripSupports(src) {
    var result = '';
    var i = 0;
    while (i < src.length) {
        if (src.substr(i, 9) === '@supports') {
            var braceStart = src.indexOf('{', i);
            if (braceStart === -1) break;
            var depth = 1;
            var j = braceStart + 1;
            while (j < src.length && depth > 0) {
                if (src[j] === '{') depth++;
                else if (src[j] === '}') depth--;
                j++;
            }
            var inner = src.substring(braceStart + 1, j - 1);
            result += inner;
            i = j;
        } else {
            result += src[i];
            i++;
        }
    }
    return result;
}

// 4) Remove @property (não suportado em Chromium antigo)
function stripProperty(src) {
    var result = '';
    var i = 0;
    while (i < src.length) {
        if (src.substr(i, 9) === '@property') {
            var braceStart = src.indexOf('{', i);
            if (braceStart === -1) break;
            var depth = 1;
            var j = braceStart + 1;
            while (j < src.length && depth > 0) {
                if (src[j] === '{') depth++;
                else if (src[j] === '}') depth--;
                j++;
            }
            // Remove inteiramente (não precisa do conteúdo)
            i = j;
        } else {
            result += src[i];
            i++;
        }
    }
    return result;
}

// 4.5) Remove :where() selectors to support Chrome < 88
function stripWhere(src) {
    // Replace the hidden selector specifically first to avoid issues
    src = src.replace(/\[hidden\]:where\(:not\(\[hidden="until-found"\]\)\)/g, '[hidden]');
    // Then replace any other :where(xxx) with xxx
    src = src.replace(/:where\(([^)]+)\)/g, '$1');
    return src;
}

css = stripLayers(css);
css = stripSupports(css);
css = stripProperty(css);
css = replaceOklch(css);
css = stripWhere(css);

// 5) Resolve variáveis de tema que podem faltar no :root (Tailwind v4 omite se @property removido)
var themeVars = {
    'var(--radius-lg)': '0.5rem',
    'var(--radius-2xl)': '1rem',
    'var(--radius-3xl)': '1.5rem',
    'var(--spacing)': '0.25rem'
};

function resolveThemeVars(src) {
    Object.keys(themeVars).forEach(function(varRef) {
        while (src.indexOf(varRef) !== -1) {
            src = src.replace(varRef, themeVars[varRef]);
        }
    });
    // Resolve calc com spacing: calc(0.25rem*N) → simplifica
    src = src.replace(/calc\(0\.25rem\s*\*\s*0\)/g, '0');
    return src;
}

css = resolveThemeVars(css);

fs.writeFileSync(cssPath, css, 'utf8');
console.log('master.css processado para compatibilidade com browsers antigos.');
