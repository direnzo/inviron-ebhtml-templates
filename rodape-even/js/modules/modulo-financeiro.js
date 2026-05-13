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
				// console.log('[DEBUG][FINANCEIRO] Item moeda:', debugItem);
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
		inner.classList.add('transition-opacity');
		inner.classList.add('duration-500');
		var _reflow = inner.offsetHeight; // força reflow para registrar estado opacity:0
		setTimeout(function () {
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

		// Não remove/recria slides, apenas preenche slots
		var root = inner.querySelector('.flex.flex-row');
		if (!root) {
			// Primeira renderização: injeta o template
			inner.innerHTML = document.getElementById('tpl-financeiro').innerHTML;
			root = inner.querySelector('.flex.flex-row');
		}
		var slideMoedas = root.querySelector('.financeiro-slide-moedas');
		var slideBolsas = root.querySelector('.financeiro-slide-bolsas');

		function preencherSlide(slideEl, lista, prefixo) {
			var tplItem = document.getElementById('tpl-financeiro-item');
			for (var k = 0; k < 3; k++) {
				var item = lista[k];
				var cont = slideEl.querySelector('[data-fin-' + prefixo + '-' + (k + 1) + ']');
				cont.innerHTML = '';
				// Reseta estilos inline de animações anteriores
				cont.style.opacity = '';
				cont.style.transform = '';
				cont.style.transition = '';
				if (!item) continue;
				var itemNode = tplItem.content ? tplItem.content.cloneNode(true) : tplItem.cloneNode(true);
				var itemRoot = itemNode.querySelector ? itemNode.querySelector('div') : itemNode.children[0];
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
			}
		}

		preencherSlide(slideMoedas, moedas, 'moeda');
		preencherSlide(slideBolsas, bolsas, 'bolsa');

		// Slides sempre presentes
		var slides = [slideMoedas, slideBolsas];
		// Só mostra slide se houver pelo menos um item
		var slidesAtivos = [];
		if (moedas.length > 0) slidesAtivos.push(slideMoedas);
		if (bolsas.length > 0) slidesAtivos.push(slideBolsas);

		// Garante que o primeiro slide já aparece imediatamente
		for (var j = 0; j < slides.length; j++) {
			if (!slides[j]) continue;
			slides[j].classList.add('transition-opacity');
			slides[j].classList.add('transition-transform');
			slides[j].classList.add('duration-500');
			slides[j].classList.add('absolute');
			slides[j].classList.add('left-0');
			slides[j].classList.add('top-0');
			slides[j].classList.add('w-full');
			slides[j].classList.add('h-full');
			slides[j].classList.add('justify-center');
			slides[j].classList.add('gap-[50vmin]');
			slides[j].classList.remove('translate-y-0');
			slides[j].classList.remove('translate-y-8');
			if (slidesAtivos.indexOf(slides[j]) === 0) {
				slides[j].classList.remove('hidden');
				var _rf = slides[j].offsetHeight; // força reflow para transition funcionar
				slides[j].classList.remove('opacity-0');
				slides[j].classList.add('opacity-100');
				slides[j].classList.remove('translate-y-8');
				slides[j].classList.add('translate-y-0');
			} else {
				slides[j].classList.remove('opacity-100');
				slides[j].classList.add('opacity-0');
				slides[j].classList.remove('translate-y-0');
				slides[j].classList.add('translate-y-8');
				slides[j].classList.add('hidden');
			}
		}

		if (slidesAtivos.length === 0) {
			if (onDone) onDone();
			return function(){};
		}

		var current = 0;
		var slideTimeout = null;
		var slideDuration = Math.floor(((config && config.itemDuracao) || 6000) / slidesAtivos.length);

		/* Anima cada item do slide subindo de baixo com stagger */
		function animarItensSlide(slideEl) {
			var items = slideEl.querySelectorAll('.financeiro-item');
			for (var k = 0; k < items.length; k++) {
				if (!items[k].firstChild) continue;
				(function (el, delay) {
					el.style.opacity = '0';
					el.style.transform = 'translateY(10px)';
					el.style.transition = 'none';
					setTimeout(function () {
						el.style.transition = 'opacity 350ms ease-out, transform 350ms ease-out';
						el.style.opacity = '1';
						el.style.transform = 'translateY(0)';
					}, delay);
				})(items[k], k * 130 + 60);
			}
		}

		function showSlide(idx) {
			for (var i = 0; i < slidesAtivos.length; i++) {
				if (!slidesAtivos[i]) continue;
				if (i === idx) {
					// Unhide com opacity-0 ainda ativo, força reflow, depois fade in
					slidesAtivos[i].classList.remove('hidden');
					var _rf = slidesAtivos[i].offsetHeight;
					slidesAtivos[i].classList.remove('opacity-0');
					slidesAtivos[i].classList.add('opacity-100');
					slidesAtivos[i].classList.remove('translate-y-8');
					slidesAtivos[i].classList.add('translate-y-0');
					animarItensSlide(slidesAtivos[i]);
				} else {
					// Fade out e esconde após transição
					slidesAtivos[i].classList.remove('opacity-100');
					slidesAtivos[i].classList.add('opacity-0');
					slidesAtivos[i].classList.remove('translate-y-0');
					slidesAtivos[i].classList.add('translate-y-8');
					(function(slide){
						setTimeout(function(){ slide.classList.add('hidden'); }, 500);
					})(slidesAtivos[i]);
				}
			}
		}

		function nextSlide() {
			current++;
			if (current < slidesAtivos.length) {
				showSlide(current);
				slideTimeout = setTimeout(nextSlide, slideDuration);
			} else {
				setTimeout(function() {
					if (onDone) onDone();
				}, 0);
			}
		}

		setTimeout(function() {
			showSlide(0);
			slideTimeout = setTimeout(nextSlide, slideDuration);
		}, 30);

		return function cancel() {
			if (slideTimeout) { clearTimeout(slideTimeout); slideTimeout = null; }
		};
	}
		return {
			tipo:        'financeiro',
			label:       'Mercado',
			parseEbhtml:  parseEbhtml,
			render:       render
		};

	}());
