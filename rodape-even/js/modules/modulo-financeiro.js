/**
 * MÓDULO FINANCEIRO — Rodapé Digital Signage
 * Dataset: D_CAMBIO
 * ES5 puro — Android 7+
 *
 * Campos esperados: M1_NOME, M1_VALOR, M1_VAR, M1_ICONE (emoji)
 *                   M2_*, M3_*, ... (até M9)
 *
 * Interface:
 *   ModuloFinanceiro.tipo        = 'financeiro'
 *   ModuloFinanceiro.label       = 'Mercado'
 *   ModuloFinanceiro.render(inner, dados, config, onDone) → cancelFn
 *   ModuloFinanceiro.parseEbhtml(rawData) → dados[]
 */

var ModuloFinanceiro = (function () {

	var MAX_INDICADORES = 9;

	function ler(rawData, campo) {
		if (!rawData) return '';
		if (typeof rawData.value === 'function') {
			var v = rawData.value(campo);
			if (v && typeof v.value !== 'undefined') {
				var val = v.value || '';
				// Filtra placeholder EBHTML: [field_name] quando campo não existe
				if (val.charAt(0) === '[' && val.charAt(val.length - 1) === ']') return '';
				return val;
			}
		}
		return '';
	}

	/* --- Formata valor: 4 casas quando < 0.1 (ex: Yen), senão 2 --- */
	function formatarValor(str) {
		if (!str) return str;
		var num = parseFloat(str);
		if (isNaN(num)) return str;
		var dec = (Math.abs(num) > 0 && Math.abs(num) < 0.1) ? 4 : 2;
		return num.toFixed(dec).replace('.', ',');
	}

	/* --- Mapa: quote key → caminho do SVG em img/
		 Retorna '' quando não há SVG disponível (usa texto como fallback)    --- */
	var SVG_ICON_MAP = {
		'dolar':  'img/dolar.svg',
		'dollar': 'img/dolar.svg',
		'euro':   'img/euro.svg'
	};

	function svgPathDeQuote(quote) {
		if (!quote) return '';
		var q = quote.toLowerCase();
		for (var key in SVG_ICON_MAP) {
			if (SVG_ICON_MAP.hasOwnProperty(key) && q.indexOf(key) >= 0) {
				return SVG_ICON_MAP[key];
			}
		}
		return '';
	}

	/* --- Texto fallback: sigla ou símbolo para quando não há SVG --- */
	function textoIcone(quote, nome) {
		var q = (quote || '').toLowerCase();
		if (q.indexOf('libra')   >= 0 || q.indexOf('pound')  >= 0) return '\u00A3'; // £
		if (q.indexOf('yen')     >= 0)                              return '\u00A5'; // ¥
		if (q.indexOf('bitcoin') >= 0)                              return '\u20BF'; // ₿
		if (q.indexOf('peso')    >= 0)                              return 'AR$';
		if (q.indexOf('bovespa') >= 0)                              return 'IBV';
		if (q.indexOf('nasdaq')  >= 0)                              return 'NSD';
		if (q.indexOf('london')  >= 0)                              return 'LSE';
		if (q.indexOf('japan')   >= 0)                              return 'NIK';
		// Fallback via nome normalizado
		var n = (nome || '').toUpperCase()
			.replace(/[ÓÒÕÔóòõô]/g, 'O')
			.replace(/[Çç]/g, 'C');
		if (n.indexOf('IENE') >= 0 || n.indexOf('YEN') >= 0) return '\u00A5';
		if (n.indexOf('BITCOIN') >= 0)                       return '\u20BF';
		return '';
	}

	/* --- Extrai lista de indicadores do item EBHTML
		 Suporta D_CAMBIO (moedas + bolsas) e D_AWESOMEAPI (moedas).
		 Bolsas (quote:) sem variação relevante são omitidas.
	--- */
	function parseEbhtml(rawData) {
		if (!rawData) return null;

		var lista = [];
		for (var n = 1; n <= MAX_INDICADORES; n++) {
			var nome = ler(rawData, 'M' + n + '_NOME');
			if (!nome) continue;

			var quote    = ler(rawData, 'M' + n + '_QUOTE');
			var valor    = ler(rawData, 'M' + n + '_VALOR') || ler(rawData, 'M' + n + '_VALOR_COMPRA');
			var variacao = ler(rawData, 'M' + n + '_VAR');

			// Exibe todas as moedas e bolsas, mesmo sem variação ou valor

			// 'quote' = índice/bolsa; 'currency' = câmbio/moeda
			var tipo = (quote && quote.indexOf('quote:') === 0) ? 'quote' : 'currency';

			// Ícone: preferir SVG (img/) > texto/sigla
			var iconeCustom = ler(rawData, 'M' + n + '_ICONE'); // geralmente vazio no EBDATA
			var iconeSvg    = svgPathDeQuote(quote);
			var iconeTexto  = iconeCustom || textoIcone(quote, nome);

			var debugItem = {
				nome:      nome,
				tipo:      tipo,
				valor:     valor ? formatarValor(valor) : '',
				variacao:  variacao,
				iconeSvg:  iconeSvg,   // path para <img> (pode ser '')
				iconeText: iconeTexto  // texto/sigla fallback
			};
			if (tipo === 'currency') {
				console.log('[DEBUG][FINANCEIRO] Item moeda:', debugItem);
			}
			lista.push(debugItem);
		}

		return lista.length > 0 ? lista : null;
	}

	/* --- Injeta SVG inline via XHR (evita problema de naturalWidth=0 em SVGs com em) --- */
	function injetarSvgInline(containerEl, src) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', src, true);
		xhr.onreadystatechange = function () {
			if (xhr.readyState !== 4) return;
			if (xhr.status === 200 || xhr.status === 0) {
				var svgEl = containerEl.querySelector('svg');
				if (svgEl) svgEl.parentNode.removeChild(svgEl);
				containerEl.innerHTML = xhr.responseText;
				var svg = containerEl.querySelector('svg');
				if (svg) {
					svg.style.width  = '100%';
					svg.style.height = '100%';
					svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
				}
			}
		};
		xhr.send();
		return xhr;
	}

	/* --- Render de um único indicador com fade --- */
	function renderItem(inner, item, config, onDone) {
		var timer = null;
		var xhr   = null;

		inner.innerHTML = '';
		inner.classList.add('opacity-0');


		   var tpl = document.getElementById('tpl-financeiro');
		   if (!tpl) return;
		   var node = tpl.content ? tpl.content.cloneNode(true) : tpl.cloneNode(true);
		   var root = node.querySelector ? node.querySelector('div') : node.children[0];
		   if (!root) return;

		   // Ícone
		   var iconeEl = root.querySelector('span');
		   if (iconeEl) {
			   if (item.iconeSvg) {
				   xhr = injetarSvgInline(iconeEl, item.iconeSvg);
			   } else if (item.iconeText) {
				   iconeEl.textContent = item.iconeText;
			   } else {
				   iconeEl.textContent = '';
			   }
		   }

		   // Nome
		   var nomeEl = root.querySelector('[data-fin-nome]');
		   if (nomeEl) nomeEl.textContent = item.nome || '';

		   // Valor
		   var valorEl = root.querySelector('[data-fin-valor]');
		   if (valorEl) valorEl.textContent = item.valor || '';

		   // Variação
		   var varNum = parseFloat(String(item.variacao).replace(',', '.'));
		   var setaImg = root.querySelector('[data-fin-seta]');
		   var varEl = root.querySelector('[data-fin-var]');
		   if (setaImg && varEl) {
			   if (!isNaN(varNum) && varNum !== 0) {
				   setaImg.style.display = '';
				   setaImg.src = varNum > 0 ? 'img/seta_amarala.png' : 'img/seta_verde.png';
				   setaImg.alt = varNum > 0 ? '+' : '-';
				   varEl.textContent = (varNum > 0 ? '+' : '') + varNum.toFixed(2).replace('.', ',') + '%';
				   varEl.className = varNum > 0 ? 'text-green-400 ' : 'text-red-400 ';
			   } else {
				   setaImg.style.display = 'none';
				   varEl.textContent = '';
				   varEl.className = '';
			   }
		   }

		   inner.appendChild(root);

		var fadeDuracao = (config && config.fadeDuracao) || 400;
		setTimeout(function () {
			inner.classList.add('transition-opacity');
			inner.classList.add('duration-500');
			inner.classList.remove('opacity-0');
			inner.classList.add('opacity-100');
		}, 20);

		var duracao = (config && config.itemDuracao) || 6000;
		timer = setTimeout(function () {
			timer = null;
			if (onDone) onDone();
		}, duracao + fadeDuracao);

		return function cancel() {
			if (timer) { clearTimeout(timer); timer = null; }
			if (xhr)   { xhr.abort();          xhr = null;  }
		};
	}

	/* --- Render: cicla todos os indicadores --- */
	function render(inner, dados, config, onDone) {
		// Separa moedas e bolsas
		var moedas = [];
		var bolsas = [];
		for (var i = 0; i < dados.length; i++) {
			if (dados[i].tipo === 'currency') moedas.push(dados[i]);
			else bolsas.push(dados[i]);
		}

		// Limpa e prepara slides
		inner.innerHTML = '';
		var tpl = document.getElementById('tpl-financeiro');
		if (!tpl) return;
		var node = tpl.content ? tpl.content.cloneNode(true) : tpl.cloneNode(true);
		var root = node.querySelector ? node.querySelector('div') : node.children[0];
		if (!root) return;

		// Helper para preencher um slide
		function preencherSlide(slideEl, lista, prefixo) {
			console.log('[DEBUG][FINANCEIRO] preencherSlide', {slideEl: slideEl, lista: lista, prefixo: prefixo});
			var tplItem = document.getElementById('tpl-financeiro-item');
			if (!tplItem) {
				console.warn('[DEBUG][FINANCEIRO] tpl-financeiro-item não encontrado');
				return;
			}
			for (var k = 0; k < 3; k++) {
				var item = lista[k];
				var cont = slideEl.querySelector('[data-fin-' + prefixo + '-' + (k + 1) + ']');
				console.log('[DEBUG][FINANCEIRO] slot', k+1, {cont: cont, item: item});
				if (!cont) continue;
				cont.innerHTML = '';
				if (!item) continue;
				// Clona template de item (do document, não do root)
				var itemNode = tplItem.content ? tplItem.content.cloneNode(true) : tplItem.cloneNode(true);
				var itemRoot = itemNode.querySelector ? itemNode.querySelector('div') : itemNode.children[0];
				if (!itemRoot) {
					console.warn('[DEBUG][FINANCEIRO] itemRoot não encontrado para slot', k+1);
					continue;
				}
				// Ícone
				var iconeEl = itemRoot.querySelector('[data-fin-ico]');
				if (iconeEl) {
					if (item.iconeSvg) {
						injetarSvgInline(iconeEl, item.iconeSvg);
					} else if (item.iconeText) {
						iconeEl.textContent = item.iconeText;
					} else {
						iconeEl.textContent = '';
					}
				}
				// Nome
				var nomeEl = itemRoot.querySelector('[data-fin-nome]');
				if (nomeEl) nomeEl.textContent = item.nome || '';
				// Valor
				var valorEl = itemRoot.querySelector('[data-fin-valor]');
				if (valorEl) valorEl.textContent = 'R$ ' + (item.valor || '');
				// Variação
				var varNum = parseFloat(String(item.variacao).replace(',', '.'));
				var setaImg = itemRoot.querySelector('[data-fin-seta]');
				var varEl = itemRoot.querySelector('[data-fin-var]');
				if (setaImg && varEl) {
					if (!isNaN(varNum) && varNum !== 0) {
						setaImg.style.display = '';
						setaImg.src = varNum > 0 ? 'img/seta_verde.png' : 'img/seta_amarala.png';
						setaImg.alt = varNum > 0 ? '+' : '-';
						varEl.textContent = Math.abs(varNum).toFixed(2).replace('.', ',') + '%';
						// Preserva classes originais e só adiciona cor
						varEl.classList.remove('text-green-800', 'text-red-800');
						if (varNum > 0) {
							varEl.classList.add('text-green-800');
						} else {
							varEl.classList.add('text-red-800');
						}
					} else {
						setaImg.style.display = 'none';
						varEl.textContent = '';
						varEl.classList.remove('text-green-800', 'text-red-800');
					}
				}
				cont.appendChild(itemRoot);
				console.log('[DEBUG][FINANCEIRO] itemRoot inserido', itemRoot);
			}
		}

		// Preenche slides
		var slideMoedas = root.querySelector('.financeiro-slide-moedas');
		var slideBolsas = root.querySelector('.financeiro-slide-bolsas');

		preencherSlide(slideMoedas, moedas, 'moeda');
		// Log DOM após preencher moedas
		if (slideMoedas) {
			console.log('[DEBUG][FINANCEIRO] slideMoedas innerHTML:', slideMoedas.innerHTML);
		}
		preencherSlide(slideBolsas, bolsas, 'bolsa');
		if (slideBolsas) {
			console.log('[DEBUG][FINANCEIRO] slideBolsas innerHTML:', slideBolsas.innerHTML);
		}

		// Só mostra slide se houver pelo menos um item
		var slides = [];
		if (moedas.length > 0) slides.push(slideMoedas);
		if (bolsas.length > 0) slides.push(slideBolsas);


		inner.appendChild(root);

		if (slides.length === 0) {
			if (onDone) onDone();
			return function(){};
		}

		// Garante que o primeiro slide já aparece imediatamente
		for (var j = 0; j < slides.length; j++) {
			if (!slides[j]) continue;
			slides[j].classList.remove('hidden');
			slides[j].classList.add('transition-opacity');
			slides[j].classList.add('duration-500');
			slides[j].classList.remove('opacity-0');
			slides[j].classList.remove('opacity-100');
		}
		slides[0].classList.remove('hidden');
		slides[0].classList.remove('opacity-0');
		slides[0].classList.add('opacity-100');

		var current = 0;
		var slideTimeout = null;
		var slideDuration = Math.floor(((config && config.itemDuracao) || 6000) / slides.length);

		function showSlide(idx) {
			// Garante que todos os slides começam visíveis e sem opacity-0
			for (var j = 0; j < slides.length; j++) {
				if (!slides[j]) continue;
				slides[j].classList.remove('hidden');
				slides[j].classList.add('transition-opacity');
				slides[j].classList.add('duration-500');
				slides[j].classList.remove('opacity-0');
				slides[j].classList.remove('opacity-100');
			}
			for (var i = 0; i < slides.length; i++) {
				if (!slides[i]) continue;
				if (i === idx) {
					slides[i].classList.remove('hidden');
					slides[i].classList.remove('opacity-0');
					slides[i].classList.add('opacity-100');
					console.log('[DEBUG][FINANCEIRO] Ativando slide', i, slides[i]);
				} else {
					slides[i].classList.remove('opacity-100');
					slides[i].classList.add('opacity-0');
					setTimeout((function(slide, idxi){
						return function(){
							slide.classList.add('hidden');
							console.log('[DEBUG][FINANCEIRO] Escondendo slide', idxi, slide);
						};
					})(slides[i], i), 500);
				}
			}
		}

		function nextSlide() {
			current++;
			if (current < slides.length) {
				showSlide(current);
				slideTimeout = setTimeout(nextSlide, slideDuration);
			} else {
				setTimeout(function() {
					if (onDone) onDone();
				}, 0);
			}
		}
	}

		return {
			tipo:        'financeiro',
			label:       'Mercado',
			parseEbhtml:  parseEbhtml,
			render:       render
		};

	}());
