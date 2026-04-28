/**
 * RODAPE MASTER — Orquestrador do template de rodapé
 * EdgeContents Digital Signage — ES5 puro (Android 7+)
 *
 * Fluxo:
 *  1. Aplica CONFIG (cores, posição, visibilidade)
 *  2. Carrega logo, inicia relógio
 *  3. Registra módulos disponíveis
 *  4. No modo EdgeContents: carrega datasets dos canais ativos
 *  5. Inicia engine de slideshow: canal → sub-itens → próximo canal → loop
 */

window.onload = function () {

	/* =====================================================
	   MÓDULOS REGISTRADOS
	   Cada módulo exporta um objeto com .tipo e .render()
	   ===================================================== */
	var MODULOS = [
		typeof ModuloClima      !== 'undefined' ? ModuloClima      : null,
		typeof ModuloFinanceiro !== 'undefined' ? ModuloFinanceiro  : null,
		typeof ModuloNoticias   !== 'undefined' ? ModuloNoticias    : null,
		typeof ModuloMensageria !== 'undefined' ? ModuloMensageria  : null,
		typeof ModuloPlacar     !== 'undefined' ? ModuloPlacar      : null,
		typeof ModuloHoroscopo  !== 'undefined' ? ModuloHoroscopo   : null
	];

	/* =====================================================
	   ESTADO GLOBAL
	   ===================================================== */
	var clockInterval = null;
	var slideshowCancelFn = null;

	/* =====================================================
	   APLICAR CONFIGURAÇÃO VISUAL
	   ===================================================== */
	function aplicarConfig() {
		var bar = document.getElementById('rodape-bar');
		if (!bar) return;

		bar.style.backgroundColor = CONFIG.corFundo;
		bar.style.color = CONFIG.corTexto;

		var dividers = document.querySelectorAll('.rodape-divider');
		for (var i = 0; i < dividers.length; i++) {
			dividers[i].style.backgroundColor = CONFIG.corDivisor;
		}

		var colLogo  = document.getElementById('col-logo');
		var div1     = document.getElementById('divider-1');
		var colClock = document.getElementById('col-clock');
		var div2     = document.getElementById('divider-2');
		var colContent = document.getElementById('col-content');

		// Posição logo
		if (CONFIG.logoPosicao === 'oculto') {
			colLogo.style.display = 'none';
			div1.style.display = 'none';
		} else if (CONFIG.logoPosicao === 'direita') {
			colLogo.style.order   = '5';
			div1.style.order      = '4';
			colContent.style.order = '3';
			div2.style.order      = '2';
			colClock.style.order  = '1';
		} else {
			// esquerda (padrão)
			colLogo.style.order   = '1';
			div1.style.order      = '2';
			colContent.style.order = '3';
			div2.style.order      = '4';
			colClock.style.order  = '5';
		}

		// Posição relógio (só ajusta quando lógica de logo já definiu content/clock)
		if (CONFIG.relogioPosicao === 'oculto') {
			colClock.style.display = 'none';
			div2.style.display = 'none';
		} else if (CONFIG.relogioPosicao === 'esquerda' &&
				   CONFIG.logoPosicao !== 'direita') {
			colClock.style.order   = '1';
			div2.style.order       = '2';
			colContent.style.order = '3';
			div1.style.order       = '4';
			colLogo.style.order    = '5';
		}

		// Conteúdo
		if (!CONFIG.conteudoVisivel) {
			colContent.style.display = 'none';
		}

		// Logo src/alt
		var logoImg = document.getElementById('logo-img');
		if (logoImg) {
			logoImg.src = CONFIG.logoPath;
			logoImg.alt = CONFIG.logoAlt;
		}

		// Aplica variáveis CSS para os ícones
		bar.style.setProperty('--clima-principal', CONFIG.corClimaPrincipal || '#000');
		bar.style.setProperty('--clima-secundaria', CONFIG.corClimaSecundaria || '#888');
	}

	/* =====================================================
	   RELÓGIO
	   ===================================================== */
	var DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
	var MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
				 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

	function atualizarRelogio() {
		var el_time = document.getElementById('clock-time');
		var el_date = document.getElementById('clock-date');
		if (!el_time || !el_date) return;

		var agora = new Date();
		var h = agora.getHours();
		var m = agora.getMinutes();
		if (h < 10) h = '0' + h;
		if (m < 10) m = '0' + m;
		el_time.textContent = h + ':' + m;

		var dia_semana = DIAS_SEMANA[agora.getDay()];
		var dia = agora.getDate();
		var mes = MESES[agora.getMonth()];
		if (dia < 10) dia = '0' + dia;
		el_date.textContent = dia_semana + ' ' + dia + '/' + mes;
	}

	function iniciarRelogio() {
		atualizarRelogio();
		clockInterval = setInterval(atualizarRelogio, 1000);
	}

	/* =====================================================
	   ENGINE DE SLIDESHOW
	   ===================================================== */

	function encontrarModulo(tipo) {
		for (var i = 0; i < MODULOS.length; i++) {
			if (MODULOS[i] && MODULOS[i].tipo === tipo) {
				return MODULOS[i];
			}
		}
		return null;
	}

	/**
	 * Transition: fade out inner → swap content → fade in
	 */
	function fadeTrocarConteudo(inner, fn, duracao) {
		inner.style.transition = 'opacity ' + duracao + 'ms';
		inner.style.opacity = '0';
		setTimeout(function () {
			fn();
			inner.style.opacity = '1';
		}, duracao);
	}

	/**
	 * Roda o canal de índice idx dentro de canaisAtivos.
	 * onCicloCompleto() é chamado quando todos os canais terminam.
	 */
	function rodarSlideshow(canaisAtivos, dados, loader, onCicloCompleto) {
		var cancelaAtual = null;

		function rodarCanal(idx) {
			if (idx >= canaisAtivos.length) {
				if (onCicloCompleto) onCicloCompleto();
				return;
			}

			var canal = canaisAtivos[idx];
			var modulo = encontrarModulo(canal.tipo);

			if (!modulo) {
				rodarCanal(idx + 1);
				return;
			}

			var dadosCanal = dados[canal.tipo];
			if (!dadosCanal) {
				rodarCanal(idx + 1);
				return;
			}


			   var inner = document.getElementById('channel-inner');
			   if (!inner) {
				   rodarCanal(idx + 1);
				   return;
			   }
			   // Limpa o conteúdo anterior antes de renderizar o próximo canal
			   inner.innerHTML = '';

			   cancelaAtual = modulo.render(inner, dadosCanal, CONFIG, function () {
				   cancelaAtual = null;
				   rodarCanal(idx + 1);
			   });

			// loaded() na primeira renderização real
			if (idx === 0 && loader && loader.loaded && !loader._rodapeLoaded) {
				loader._rodapeLoaded = true;
				loader.loaded();
			}
		}

		rodarCanal(0);

		slideshowCancelFn = function () {
			if (cancelaAtual) {
				cancelaAtual();
				cancelaAtual = null;
			}
		};
	}

	/* =====================================================
	   INICIAR TEMPLATE
	   ===================================================== */
	function iniciarTemplate(dados, loader) {
		aplicarConfig();
		iniciarRelogio();

		var canaisAtivos = [];
		for (var i = 0; i < CONFIG.canais.length; i++) {
			var c = CONFIG.canais[i];
			if (c.ativo && dados[c.tipo] && dados[c.tipo].length > 0) {
				canaisAtivos.push(c);
			}
		}

		if (canaisAtivos.length === 0) {
			console.error('[Rodape] Nenhum canal ativo com dados disponíveis.');
			if (loader) loader.finished();
			return;
		}

		rodarSlideshow(canaisAtivos, dados, loader, function () {
			if (clockInterval) {
				clearInterval(clockInterval);
				clockInterval = null;
			}
			if (loader) loader.finished();
		});
	}

	/* =====================================================
	   MODO MOCK
	   ===================================================== */
	if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.enabled) {
		var mockLoader = {
			loaded:   function () { console.log('[RodapeMock] loaded()'); },
			finished: function () { console.log('[RodapeMock] finished()'); }
		};
		var mockDataParsed = {};
		for (var i = 0; i < CONFIG.canais.length; i++) {
			var canal = CONFIG.canais[i];
			if (!canal.ativo) continue;
			var tipo = canal.tipo;
			var modulo = encontrarModulo(tipo);
			var raw = MOCK_DATA.canais[tipo];
			var parsed = (modulo && modulo.parseEbhtml) ? modulo.parseEbhtml(raw) : raw;
			if (parsed && parsed.length > 0) {
				mockDataParsed[tipo] = parsed;
			}
		}
		iniciarTemplate(mockDataParsed, mockLoader);
		return;
	}

	/* =====================================================
	   MODO EDGECONTENTS
	   ===================================================== */
	ebhtml.create2({}, function (loader) {

		for (var i = 0; i < CONFIG.canais.length; i++) {
			var canal = CONFIG.canais[i];
			if (canal.ativo) {
				loader.addData(canal.dataset, false);
				if (canal.datasetSecundario) {
					loader.addData(canal.datasetSecundario, false);
				}
			}
		}

		loader.autoloaded = false;
		loader.nodataiserror = false;

		loader.load(function () {

			var dadosCarregados = {};

			for (var i = 0; i < CONFIG.canais.length; i++) {
				var canal = CONFIG.canais[i];
				if (!canal.ativo) continue;


				var rawData = loader.data(canal.dataset);
				var rawDataSecundario = canal.datasetSecundario
					? loader.data(canal.datasetSecundario)
					: null;
				if (!rawData && !rawDataSecundario) continue;

				   var modulo = encontrarModulo(canal.tipo);
				   var parsed;
				   // Para clima, nunca passar dataset secundário (D_CLIMA)
				   if (canal.tipo === 'clima' && modulo && modulo.parseEbhtml) {
					   parsed = modulo.parseEbhtml(rawData, null);
				   } else if (modulo && modulo.parseEbhtml) {
					   parsed = modulo.parseEbhtml(rawData, rawDataSecundario);
				   } else {
					   parsed = rawData;
				   }
				   if (parsed) {
					   // Para clima, sempre garantir array
					   if (canal.tipo === 'clima') {
						   if (parsed instanceof Array) {
							   if (parsed.length > 0) dadosCarregados[canal.tipo] = parsed;
						   } else {
							   dadosCarregados[canal.tipo] = [parsed];
						   }
					   } else if (parsed.length > 0) {
						   dadosCarregados[canal.tipo] = parsed;
					   }
				   }
			}

			var temDados = false;
			for (var chave in dadosCarregados) {
				if (dadosCarregados.hasOwnProperty(chave)) {
					temDados = true;
					break;
				}
			}

			if (!temDados) {
				console.error('[Rodape] Sem dados em nenhum canal ativo.');
				loader.finished();
				return;
			}

			iniciarTemplate(dadosCarregados, loader);
		});
	});
};
