/**
 * MOCK DE DADOS - D_CONDOMINIO
 * 
 * Intercepta a requisição XMLHttpRequest do EBHTML para redirecionar ao XML local.
 * NÃO substitui o ebhtml.create2() — o EBHTML roda REAL (loaded/finished originais).
 * 
 * Como funciona:
 *   EBHTML tenta carregar http://127.0.0.1:13199/CONTENT/DATA/D_CONDOMINIO?...
 *   O mock redireciona para /FILES/1/js/D_CONDOMINIO.xml
 * 
 * Para PROD: comente este script no index.html
 */
(function() {
    // Se estiver no EdgeContents real (com ebflashinterface), não ativa
    if (typeof window.ebflashinterface !== 'undefined') { return; }
    
    var XML_PATH = '/FILES/1/js/D_CONDOMINIO.xml';
    var TARGET_PATTERN = '/content/data/D_CONDOMINIO';
    
    console.log('[Mock] Interceptando XHR: ' + TARGET_PATTERN + ' -> ' + XML_PATH);
    
    var OrigXHR = window.XMLHttpRequest;
    
    window.XMLHttpRequest = function() {
        var xhr = new OrigXHR();
        
        // Preservar referência ao open original
        var origOpen = xhr.open;
        
        // Substituir open: redireciona se for a URL do dataset
        xhr.open = function(method, url, async, user, pass) {
            if (typeof url === 'string' && url.indexOf(TARGET_PATTERN) >= 0) {
                url = XML_PATH + '?_t=' + Date.now();
            }
            return origOpen.call(xhr, method, url, async, user, pass);
        };
        
        return xhr;
    };
    
    // Preservar prototype e constantes para instanceof e compatibilidade
    window.XMLHttpRequest.prototype = OrigXHR.prototype;
    window.XMLHttpRequest.UNSENT = OrigXHR.UNSENT;
    window.XMLHttpRequest.OPENED = OrigXHR.OPENED;
    window.XMLHttpRequest.HEADERS_RECEIVED = OrigXHR.HEADERS_RECEIVED;
    window.XMLHttpRequest.LOADING = OrigXHR.LOADING;
    window.XMLHttpRequest.DONE = OrigXHR.DONE;
})();