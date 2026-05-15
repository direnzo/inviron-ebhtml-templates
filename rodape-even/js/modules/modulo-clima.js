/* --- Injeta SVG inline via XHR (evita problema de naturalWidth=0 em SVGs com em) --- */
	function carregarSvgInline(containerEl, src) {
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
/**
 * MÓDULO CLIMA — Rodapé Digital Signage
 * ES5 puro — Android 7+
 *
 * Datasets suportados:
 *   D_CLIMA_CLIMATEMPO  — dataset principal (JSON arrays).
 *                         Fornece: temperatura atual, ícone, descrição,
 *                         cidade/UF, e min/max do dia via nr_min_wea / nr_max_wea.
 *
 *   D_CLIMA             — dataset simplificado (campos flat).
 *                         Fornece SOMENTE: C1_D1_MIN, C1_D1_MAX, C1_D1_ICO,
 *                         C1_D1_CIDADE, C1_D1_TEXTPT.
 *                         Usado como:
 *                           a) complemento ao D_CLIMA_CLIMATEMPO (fallback min/max)
 *                           b) fonte standalone quando D_CLIMA_CLIMATEMPO não está ativo
 *
 * Interface:
 *   ModuloClima.tipo        = 'clima'
 *   ModuloClima.label       = 'Clima'
 *   ModuloClima.render(inner, dados, config, onDone) → cancelFn
 *   ModuloClima.parseEbhtml(rawDataClimatempo, rawDataClima) → dados
 *     rawDataClimatempo: item EBHTML de D_CLIMA_CLIMATEMPO (pode ser null)
 *     rawDataClima:      item EBHTML de D_CLIMA (pode ser null)
 */

var ModuloClima = (function () {

	/* -------------------------------------------------------------------
	   Códigos com variante noturna disponível ({codigo}n.svg)
	   Demais códigos (ex: 11) usam somente a versão diurna.
	------------------------------------------------------------------- */
	var COM_VARIANTE_NOITE = {
		'1': true, '2': true, '3': true, '4': true, '5': true,
		'6': true, '7': true, '8': true, '9': true
	};

	function iconeArquivo(codigo, isNoite) {
		if (!codigo) codigo = '3';
		codigo = String(codigo);
		if (isNoite && COM_VARIANTE_NOITE[codigo]) {
			return codigo + 'n.svg';
		}
		return codigo + '.svg';
	}

	function parseJsonArray(valor) {
		if (!valor) return [];
		if (typeof valor === 'string') {
			try {
				var p = JSON.parse(valor);
				return (p && typeof p.length !== 'undefined') ? p : [];
			} catch (e) { return []; }
		}
		return (typeof valor.length !== 'undefined') ? valor : [];
	}

	/* --- Lê campo flat de um item EBHTML --- */
	function lerCampo(rawData, campo) {
		if (!rawData) return '';
		if (typeof rawData.value === 'function') {
			var v = rawData.value(campo);
			return (v && typeof v.value !== 'undefined') ? (v.value || '') : '';
		}
		return '';
	}

	/* -------------------------------------------------------------------
	   parseEbhtml(rawDataClimatempo, rawDataClima)

	   Estratégia:
		 1. Tenta D_CLIMA_CLIMATEMPO (arrays JSON horários):
			- temperatura atual (nr_value_wea)
			- ícone (nr_icon_wea)
			- descrição (mm_textpt_wea)
			- cidade/UF (city.ds_name_cit / ds_state_cit)
			- min/max do dia (nr_min_wea / nr_max_wea) — dentro do array

		 2. Se min/max vier vazio dos arrays (ou D_CLIMA_CLIMATEMPO não disponível),
			usa D_CLIMA como fallback:
			- C1_D1_MIN → tempMin
			- C1_D1_MAX → tempMax
			- C1_D1_ICO → iconeCodigo (se campos principais estiver vazio)
			- C1_D1_CIDADE → cidade (se campos principais estiver vazio)
			- C1_D1_TEXTPT → descrição (se vazia)
	------------------------------------------------------------------- */
	   function parseEbhtml(rawDataClimatempo, rawDataClima) {
			  var resultado = {
				  tempAtual:   '',
				  tempMin:     '',
				  tempMax:     '',
				  descricao:   '',
				  umidade:     '',
				  vento:       '',
				  uv:          '',
				  uvLevel:     '',
				  iconeCodigo: '3',
				  isNoite:     false
			  };

			  // ---- FONTE PRIMÁRIA: D_CLIMA_CLIMATEMPO ----
			  if (rawDataClimatempo) {
				  var arr = parseJsonArray(lerCampo(rawDataClimatempo, 'C1_D1_DATAARRAY'));
				  if (arr.length === 0) arr = parseJsonArray(lerCampo(rawDataClimatempo, 'C1_D2_DATAARRAY'));
				  if (arr.length === 0) arr = parseJsonArray(lerCampo(rawDataClimatempo, 'C1_D3_DATAARRAY'));

				  if (arr.length > 0) {
					  // Pega o registro do período atual (primeiro do array)
					  var reg = arr[0];
					  if (reg) {
						  resultado.tempAtual   = reg.nr_value_wea || '';
						  resultado.tempMin     = reg.nr_min_wea || '';
						  resultado.tempMax     = reg.nr_max_wea || '';
						  resultado.descricao   = reg.mm_textpt_wea || '';
						  // Umidade: mostra faixa se houver min/max, senão só um valor
						  if (reg.nr_humiditymin_wea && reg.nr_humiditymax_wea) {
							  resultado.umidade = reg.nr_humiditymin_wea + '-' + reg.nr_humiditymax_wea;
						  } else if (reg.nr_humiditymin_wea) {
							  resultado.umidade = reg.nr_humiditymin_wea;
						  } else if (reg.nr_humiditymax_wea) {
							  resultado.umidade = reg.nr_humiditymax_wea;
						  }
						  // Vento: usar apenas média e direção
						  if (reg.nr_windavgvelocity_wea) {
							  resultado.vento = reg.nr_windavgvelocity_wea;
							  if (reg.ds_winddirection_wea) resultado.direcaoVento = reg.ds_winddirection_wea;
						  } else if (reg.nr_windminvelocity_wea && reg.nr_windmaxvelocity_wea) {
							  resultado.vento = reg.nr_windminvelocity_wea + '-' + reg.nr_windmaxvelocity_wea;
							  if (reg.ds_winddirection_wea) resultado.direcaoVento = reg.ds_winddirection_wea;
						  } else if (reg.nr_windminvelocity_wea) {
							  resultado.vento = reg.nr_windminvelocity_wea;
							  if (reg.ds_winddirection_wea) resultado.direcaoVento = reg.ds_winddirection_wea;
						  } else if (reg.nr_windmaxvelocity_wea) {
							  resultado.vento = reg.nr_windmaxvelocity_wea;
							  if (reg.ds_winddirection_wea) resultado.direcaoVento = reg.ds_winddirection_wea;
						  }
						  // UV
						  if (reg.nr_uv_wea) resultado.uv = reg.nr_uv_wea;
						  if (reg.ds_uvlevel_wea) resultado.uvLevel = reg.ds_uvlevel_wea;
						  resultado.iconeCodigo = reg.nr_icon_wea || '3';
					  // Detecta noite: nr_period_wea == '1' (madrugada/noite)
					  resultado.isNoite     = (reg.nr_period_wea == '1');
					  }
				  }
			  }

			  // Fallback: se algum campo principal estiver vazio, tenta D_CLIMA
			  if (rawDataClima) {
				  if (!resultado.tempMin)     resultado.tempMin     = lerCampo(rawDataClima, 'C1_D1_MIN');
				  if (!resultado.tempMax)     resultado.tempMax     = lerCampo(rawDataClima, 'C1_D1_MAX');
				  if (!resultado.iconeCodigo || resultado.iconeCodigo === '3') resultado.iconeCodigo = lerCampo(rawDataClima, 'C1_D1_ICO') || '3';
				  if (!resultado.descricao)  resultado.descricao   = lerCampo(rawDataClima, 'C1_D1_TEXTPT');
			  }

			  return resultado;
	   }

	/* --- Render --- */
	function render(inner, dados, config, onDone) {
		var timer = null;
		var xhr = null;
		var svgXhrs = [];

		// Padroniza: espera sempre array, pega o primeiro item
		if (dados instanceof Array) {
			dados = dados[0];
		}
		if (!dados) { if (onDone) onDone(); return; }

		// Usa o template HTML
		inner.innerHTML = '';
		inner.classList.add('opacity-0');
		var tpl = document.getElementById('tpl-clima');
		if (!tpl) { if (onDone) onDone(); return; }
		var node = tpl.content ? tpl.content.cloneNode(true) : tpl.cloneNode(true);
		var root = node.querySelector ? node.querySelector('div') : node.children[0];
		if (!root) { if (onDone) onDone(); return; }

		// Cria grupo ícone+temp UMA vez — será movido entre slides no showSlide
		var iconGroup = document.createElement('span');
		iconGroup.className = 'flex items-center gap-[2vmin] flex-shrink-0';

		var iconSlot = document.createElement('span');
		iconSlot.className = 'flex items-center justify-center size-[58vmin]';
		iconGroup.appendChild(iconSlot);

		var tempSpan = document.createElement('span');
		tempSpan.className = 'font-bold';
		tempSpan.textContent = (dados.tempAtual !== '' && dados.tempAtual !== null) ? dados.tempAtual + '°' : '';
		iconGroup.appendChild(tempSpan);

		var iconeArq = dados.iconeCodigo ? 'img/clima/' + iconeArquivo(dados.iconeCodigo, dados.isNoite) : null;
		if (iconeArq) {
			xhr = carregarSvgInline(iconSlot, iconeArq);
		}


		// Máxima com SVG compass (seta para cima)
		var maxEl = root.querySelector('[data-clima-max]');
		var maxIco = root.querySelector('[data-clima-max-ico]');
		if (maxEl) maxEl.textContent = (dados.tempMax !== '' ? dados.tempMax + '°' : '');
		if (maxIco) {
			svgXhrs.push(carregarSvgInline(maxIco, 'img/clima/compass.svg'));
			// Polling para garantir que o SVG e path estejam presentes
			(function tentaColorirMax(tries) {
				if (tries > 20) return; // timeout de ~600ms
				var svg = maxIco.querySelector('svg');
				if (svg) {
					var path = svg.querySelector('path');
					if (path) {
						path.setAttribute('fill', '#ff0000'); // vermelho para máxima
						return;
					}
				}
				setTimeout(function() { tentaColorirMax(tries + 1); }, 30);
			})(0);
		}

		// Mínima com SVG compass (seta para baixo)
		var minEl = root.querySelector('[data-clima-min]');
		var minIco = root.querySelector('[data-clima-min-ico]');
		if (minEl) minEl.textContent = (dados.tempMin !== '' ? dados.tempMin + '°' : '');
		if (minIco) {
			svgXhrs.push(carregarSvgInline(minIco, 'img/clima/compass.svg'));
			(function tentaColorirMin(tries) {
				if (tries > 20) return;
				var svg = minIco.querySelector('svg');
				if (svg) {
					var path = svg.querySelector('path');
					if (path) {
						path.setAttribute('fill', '#3b82f6'); // azul para mínima
						return;
					}
				}
				setTimeout(function() { tentaColorirMin(tries + 1); }, 30);
			})(0);
		}

		// Descrição
		var descEl = root.querySelector('[data-clima-desc]');
		if (descEl) descEl.textContent = dados.descricao || '';


		// Umidade com SVG inline
		var umidEl = root.querySelector('[data-clima-umidade]');
		var umidIco = root.querySelector('[data-clima-umidade-ico]');
		var umidText = root.querySelector('[data-clima-umidade-text]');
		if (umidEl && umidText && umidIco) {
			if (dados.umidade) {
				var valorUmidade = '';
				if (typeof dados.umidade === 'string' && dados.umidade.indexOf('-') !== -1) {
					// Se vier faixa, pega só o segundo valor (máxima)
					var partes = dados.umidade.split('-');
					valorUmidade = partes[1] ? partes[1].replace(/[^0-9]/g, '') : partes[0];
				} else {
					valorUmidade = String(dados.umidade).replace(/[^0-9]/g, '');
				}
				umidText.textContent = valorUmidade + '%';
				svgXhrs.push(carregarSvgInline(umidIco, 'img/clima/humidity.svg'));
				umidIco.style.display = '';
			} else {
				umidText.textContent = '';
				umidIco.innerHTML = '';
				umidIco.style.display = 'none';
			}
		}

		// Vento com SVG inline e bússola
		var ventoEl = root.querySelector('[data-clima-vento]');
		var ventoIco = root.querySelector('[data-clima-vento-ico]');
		var ventoText = root.querySelector('[data-clima-vento-text]');
		var ventoCompass = root.querySelector('[data-clima-vento-compass]');
		if (ventoEl && ventoText && ventoIco && ventoCompass) {
			if (dados.vento) {
				ventoText.textContent = dados.vento + 'km/h';
				svgXhrs.push(carregarSvgInline(ventoIco, 'img/clima/wind.svg'));
				ventoIco.style.display = '';
				// Compass: direção do vento
				if (typeof dados.direcaoVento === 'string' && dados.direcaoVento.length > 0) {
					svgXhrs.push(carregarSvgInline(ventoCompass, 'img/clima/compass.svg'));
					ventoCompass.style.display = '';
					setTimeout(function() {
						var dir = dados.direcaoVento;
						var ang = direcaoCardinalParaAngulo(dir);
						// console.log('[Clima] Direção vento recebida:', dir);
						// console.log('[Clima] Ângulo calculado:', ang);
						ventoCompass.style.transform = 'rotate(' + ang + 'deg)';
						// console.log('[Clima] Rotação aplicada ao container:', ventoCompass);
					}, 50);
				} else {
					ventoCompass.innerHTML = '';
					ventoCompass.style.display = 'none';
				}
			} else {
				ventoText.textContent = '';
				ventoIco.innerHTML = '';
				ventoIco.style.display = 'none';
				ventoCompass.innerHTML = '';
				ventoCompass.style.display = 'none';
			}
		}

		// Função para converter direção cardinal para ângulo (N=0, L=90, S=180, O=270)
		function direcaoCardinalParaAngulo(dir) {
			var mapa = {
				'N': 0,
				'NNE': 22.5,
				'NE': 45,
				'ENE': 67.5,
				'E': 90,
				'ESE': 112.5,
				'SE': 135,
				'SSE': 157.5,
				'S': 180,
				'SSW': 202.5,
				'SW': 225,
				'WSW': 247.5,
				'W': 270,
				'WNW': 292.5,
				'NW': 315,
				'NNW': 337.5
			};
			dir = String(dir).toUpperCase().replace(/[^A-Z]/g, '');
			if (mapa[dir] !== undefined) return mapa[dir];
			// Tenta abreviações comuns
			if (dir === 'NORTE') return 0;
			if (dir === 'LESTE') return 90;
			if (dir === 'SUL') return 180;
			if (dir === 'OESTE') return 270;
			return 0;
		}

		// UV
		var uvEl = root.querySelector('[data-clima-uv]');
		var uvIco = uvEl ? uvEl.querySelector('[data-clima-umidade-ico]') : null;
		var uvText = uvEl ? uvEl.querySelector('[data-clima-uv-text]') : null;
		if (uvEl && uvIco && uvText) {
			if (dados.uv) {
				var uvNum = parseInt(dados.uv, 10);
				if (!isNaN(uvNum) && uvNum >= 1 && uvNum <= 11) {
					svgXhrs.push(carregarSvgInline(uvIco, 'img/clima/meteocons--uv-index-' + uvNum + '-fill.svg'));
					uvIco.style.display = '';
				} else {
					uvIco.innerHTML = '';
					uvIco.style.display = 'none';
				}
				uvText.textContent = dados.uvLevel ? ('UV ' + String(dados.uvLevel)) : '';
				uvEl.style.display = '';
			} else {
				uvIco.innerHTML = '';
				uvIco.style.display = 'none';
				uvText.textContent = '';
				uvEl.style.display = 'none';
			}
		}

		inner.appendChild(root);

		// Fade in: transition deve estar definida ANTES da mudança de opacity
		var fadeDuracao = (config && config.fadeDuracao) || 400;
		inner.classList.add('transition-opacity');
		inner.classList.add('duration-500');
		var _reflow = inner.offsetHeight; // força reflow para registrar estado opacity:0
		setTimeout(function () {
			inner.classList.remove('opacity-0');
			inner.classList.add('opacity-100');
		}, 20);

		// --- Subpaginação dos dados de clima ---
		var slides = [
			root.querySelector('.clima-slide-1'),
			root.querySelector('.clima-slide-2'),
			root.querySelector('.clima-slide-3')
		];
		var current = 0;
		var slideTimeout = null;
		var slideDuration = Math.floor(((config && config.itemDuracao) || 7000));
		// console.log('[DEBUG][CLIMA] Config itemDuracao:', config && config.itemDuracao, 'ms, slideDuration:', slideDuration, 'ms');

		function showSlide(idx) {
			// Move o iconGroup para o placeholder do slide ativo
			var wrapper = slides[idx] && slides[idx].querySelector('.clima-icon-group');
			if (wrapper) wrapper.appendChild(iconGroup);

			for (var i = 0; i < slides.length; i++) {
				if (!slides[i]) continue;
				if (i === idx) {
					// Unhide com opacity-0 ainda ativo, força reflow, depois fade in
					slides[i].style.display = '';
					var _rf = slides[i].offsetHeight;
					slides[i].classList.remove('opacity-0');
					slides[i].classList.add('opacity-100');
					slides[i].classList.remove('translate-y-8');
					slides[i].classList.add('translate-y-0');
				} else {
					// Fade out e esconde após transição
					slides[i].classList.remove('opacity-100');
					slides[i].classList.add('opacity-0');
					slides[i].classList.remove('translate-y-0');
					slides[i].classList.add('translate-y-8');
					setTimeout((function(slide){
						return function(){ slide.style.display = 'none'; };
					})(slides[i]), 500);
				}
			}
		}

		function nextSlide() {
			current++;
			if (current < slides.length) {
				showSlide(current);
				slideTimeout = setTimeout(nextSlide, slideDuration);
			} else {
				// Último slide, termina
				setTimeout(function() {
					if (onDone) onDone();
				}, 0);
			}
		}

		// Inicia na primeira página após fade-in
		setTimeout(function() {
			showSlide(0);
			slideTimeout = setTimeout(nextSlide, slideDuration);
		}, fadeDuracao + 30);

		// Cancela timeout se for interrompido
		var oldCancel = typeof timer === 'function' ? timer : null;
		var cancel = function() {
			if (slideTimeout) { clearTimeout(slideTimeout); slideTimeout = null; }
			if (timer) { clearTimeout(timer); timer = null; }
			if (xhr)   { xhr.abort();           xhr = null;   }
			for (var _i = 0; _i < svgXhrs.length; _i++) {
				if (svgXhrs[_i]) svgXhrs[_i].abort();
			}
			svgXhrs = [];
			if (oldCancel) oldCancel();
		};

		return cancel;
	}

	return {
		tipo:       'clima',
		label:      'Clima',
		parseEbhtml: parseEbhtml,
		render:     render
	};

}());
