# Playbook Completo de Templates EdgeContents

Objetivo deste documento:
- consolidar o que funcionou no workspace
- padronizar criacao, debug, analise e encerramento
- reduzir retrabalho
- servir como base para criacao de agents que gerem templates prontos para uso com poucas perguntas

## 1) Principios de engenharia (nao negociaveis)

1. Ambiente de teste oficial
- URL: http://localhost:12099/FILES/1/index.html
- Nao usar file:/// para validacao final
- Nao usar servidor alternativo para validacao real

2. Compatibilidade de runtime
- JavaScript ES5 obrigatorio
- Sem const/let/arrow/template string/Promise/async-await
- Evitar APIs modernas sem fallback
- Baseline de browser: Chromium 78 (versao minima comum suportada)
- Tudo que exigir versao maior deve ter fallback explicito

5. Politica de estado e rotacao de conteudo
- Evitar ao maximo uso de localStorage para controle funcional de exibicao
- Priorizar controle por dataset (parametros, filtros, lote, item unico e ordenacao)
- EBHTML e a fonte de verdade para selecionar o que exibir e em qual ordem

3. Ciclo de vida de playlist
- loader.loaded() somente em sucesso
- loader.finished() sempre (sucesso ou erro)
- nunca deixar fluxo sem finalizacao

4. Responsividade e legibilidade
- Layout deve sobreviver a variacoes extremas de proporcao
- Tipografia deve escalar sem quebrar bloco visual
- Dados ausentes nao podem quebrar render

6. Estrutura de UI e responsabilidade do JS
- Evitar ao maximo criacao de classes CSS personalizadas
- Priorizar classes utilitarias do TailwindCSS raiz
- Usar HTML semantico como padrao (header, main, section, article, aside, footer)
- Evitar JS para montar HTML em string quando a estrutura puder ser declarada no HTML
- JS deve focar em: carregar, normalizar e popular dados na estrutura semantica existente

7. Preview obrigatorio por template
- Todo template deve ter preview.js
- Preview deve funcionar igual ao runtime do template
- A unica diferenca entre preview e runtime deve ser a origem dos dados
- Preview prioriza dados do formulario do browser (frame pai) e usa fallback controlado

## 2) Tipos de template e nivel de risco

| Tipo | Exemplo | Risco principal | Mitigacao principal |
|---|---|---|---|
| Noticias | manchetes/feed | texto longo e corte ruim | regras de truncamento + hierarquia clara |
| Previsao | clima atual + proximos dias | dados faltantes/icone invalido | fallback por campo + icone padrao |
| Precos | cartaz/grade | alinhamento numerico e destaque de oferta | grid previsivel + formato monetario padrao |
| Comunicados | texto institucional | baixa densidade visual | composicao com foco em leitura |
| Menuboard | lista de produtos | variacao grande de itens e promo | layout elastico + regras de prioridade |

## 3) Stack por etapa (criacao, debug, analise, conclusao)

### 3.1 Stack de criacao

- HTML semantico e previsivel
- TailwindCSS compilado para CSS compativel
- JavaScript ES5 modular por responsabilidade
- EBHTML (create2, addData, load, data, datalist, parameters/filtros/order)
- Mock data alinhado ao contrato real

Diretrizes de implementacao visual:
- declarar estrutura base no HTML (evitar construcao de arvores via JS)
- usar utilitarios Tailwind antes de criar classe customizada
- criar classe customizada apenas quando houver repeticao real de padrao ou limitacao tecnica

Diretriz de implementacao funcional:
- manter uma unica pipeline de render/populacao reaproveitada por runtime e preview
- preview.js deve apenas adaptar origem de dados e controlar ciclo de loader no modo extranet

Saidas obrigatorias da etapa:
- contrato de dados documentado
- layout base responsivo
- render principal funcional
- fluxo de playlist finalizando corretamente

### 3.2 Stack de debug

- Console do navegador (erros JS e logs de estado)
- Logs de milestones no fluxo (init/load/render/finish)
- Validacao de dataset: existencia, count, campos obrigatorios
- Inspecao visual de overflow/corte/alinhamento
- Testes com e sem dados

Padrao minimo de logs (na fase de desenvolvimento):
- [INIT] template iniciado
- [DATA] datasets registrados
- [LOAD] sucesso/falha
- [RENDER] dados normalizados e quantidade
- [END] loaded chamado / finished chamado

### 3.3 Stack de analise

- Matriz de requisitos (conteudo x layout x tempo)
- Matriz de riscos (probabilidade x impacto)
- Gap analysis (contrato esperado x dataset real)
- Verificacao de regressao com checklist padrao

Entregavel da analise:
- lista de nao conformidades
- causa raiz de cada problema
- plano de correcao priorizado

### 3.4 Stack de conclusao (go/no-go)

- checklist de aceite tecnico
- checklist de aceite visual
- checklist de aceite de dados
- status final: GO, GO COM RISCO CONTROLADO, ou NO-GO

### 3.5 Stack de performance para hardware legado

Objetivo:
- entregar sempre o minimo executavel em equipamentos antigos
- desativar recursos pesados sem quebrar identidade visual
- manter estabilidade e fluidez da playlist

Base validada no template hora_certa:
- deteccao automatica por heuristica de dispositivo
- modo reduzido com classes CSS e desligamento de efeitos pesados
- loop adaptativo do relogio (requestAnimationFrame em forte, setTimeout em fraco)

Heuristica recomendada (ES5):
- Android antigo (exemplo: versao <= 8)
- CPU limitada (exemplo: hardwareConcurrency <= 4)
- memoria limitada (exemplo: deviceMemory <= 2)

Politica de degradacao progressiva:
1. Nivel 0 (normal)
- todos os efeitos ativos

2. Nivel 1 (reduzido)
- desativar animacoes de fundo
- remover sombras e blur pesados
- reduzir frequencia de update de loops visuais

3. Nivel 2 (minimo executavel)
- manter apenas informacao essencial na tela
- remover componentes decorativos nao criticos
- priorizar legibilidade e estabilidade

Regra de implementacao:
- a deteccao de hardware deve ocorrer cedo no bootstrap
- a decisao de modo deve ser centralizada em funcao unica
- o modo aplicado deve ser refletido em classe global (ex: reduced)
- recursos pesados devem obedecer ao modo ativo

Checklist de aceite de performance:
- template nao trava em dispositivo fraco
- tempo de resposta visual permanece consistente
- consumo visual reduzido sem perder conteudo critico
- playlist finaliza corretamente em todos os modos

Estudo de caso interno (hora_certa):
- deteccao com userAgent + hardwareConcurrency + deviceMemory
- classe reduced aplicada em html/body para desligar animacoes e efeitos pesados
- ondas e fundo animado desativados em modo reduzido
- loop do relogio adaptado por capacidade do dispositivo
- flag de forca para homologar modo reduzido mesmo em maquina forte

### 3.6 Stack de compatibilidade para Chromium 78

Objetivo:
- garantir funcionamento no baseline minimo comum
- evitar regressao por uso acidental de features acima do suporte

Checklist obrigatorio:
- sem clamp() sem fallback
- sem gap em flex sem alternativa por margem
- sem aspect-ratio sem fallback por padding
- sem rgb(r g b / alpha) sem fallback em hex/rgba classico
- sem dependencia de APIs JS modernas sem protecao

Pratica de decisao:
- toda feature visual nova deve declarar requisito minimo
- se requisito for maior que 78, incluir fallback no mesmo PR

### 3.7 Stack de video (midia pesada)

Objetivo:
- usar video apenas quando agregar valor real
- manter exibicao estavel em hardware antigo

Politica de uso:
- validar suporte de formato antes de tocar (ex: canPlayType para mp4)
- usar muted + playsinline + autoplay quando for background
- ter fallback de imagem para qualquer falha de video
- definir timeout ou regra de corte para evitar bloqueio de fluxo
- em erro, abortar video e seguir com fallback sem travar playlist

Checklist tecnico de video:
- carregamento seguro com onended/onerror/onabort/onstalled
- fallback visual imediato
- integracao com loaded/finished preservada
- compatibilidade testada no baseline 78

### 3.9 Stack de rotacao por dataset (sem estado local)

Objetivo:
- controlar rotacao de conteudo no proprio canal de dados
- reduzir acoplamento com estado persistido no player

Diretrizes:
- usar addData com parametros para recorte de lote quando aplicavel
- usar filtros de dataset para selecionar subconjuntos por contexto
- usar ordenacao no dataset para definir sequencia oficial de exibicao
- usar modo item unico quando a regra de negocio exigir destaque unico
- tratar dataset como autoridade de prioridade e ordem

Quando admitir excecao:
- localStorage somente para telemetria nao critica ou experimento de desenvolvimento
- nunca depender de localStorage para regra principal de negocio

### 3.10 Stack de preview (paridade runtime/extranet)

Objetivo:
- garantir previsibilidade visual e funcional antes da publicacao
- reproduzir no browser o mesmo template final

Regras de arquitetura:
- preview.js obrigatorio em todo template
- reutilizar a mesma funcao de populacao/render do runtime
- nao duplicar regra de negocio entre master.js e preview.js
- preview recebe dados do formulario via frame pai (window.parent)
- ordem recomendada de origem:
	1. getTemplatePreviewData()
	2. templatePreviewData
	3. TEMPLATE_PREVIEW_DATA
	4. fallback controlado (mock/dataset)

Regra de loader no preview:
- loaded pode ser repassado quando aplicavel
- finished deve ser suprimido no modo preview para manter visualizacao estavel

Checklist de paridade:
- mesmos mapeamentos e normalizacao de campos
- mesmos fallbacks visuais
- mesmo comportamento de componentes
- diferenca apenas na origem dos dados

### 3.8 Stack de animacao e transicao (governanca)

Objetivo:
- padronizar quando animar e quando nao animar
- permitir ligar/desligar animacoes com facilidade

Quando usar animacao:
- entrada/saida de conteudo (fade)
- troca de bloco (slide)
- foco de destaque pontual (scale leve)

Quando evitar animacao:
- informacao critica que precisa leitura imediata
- hardware em modo reduzido/minimo
- cadeias de animacoes simultaneas sem ganho informacional

Controle de animacao padrao:
- flags de config: enableAnimations, animationProfile, forceReducedMode
- classe global de estado: reduced
- perfis recomendados:
	- full: transicoes completas
	- lite: apenas fade curto
	- off: sem animacao, apenas troca direta

Padrao de duracao recomendado:
- fade de entrada: 300ms a 800ms
- slide: 250ms a 600ms
- escala: curta e sutil, sem looping continuo

Regra de seguranca:
- toda animacao deve ter caminho funcional equivalente sem animacao

## 4) Arquitetura padrao de template

Camadas:
1. Config
2. Data access (EBHTML)
3. Normalizacao de dados
4. Micro funcoes reutilizaveis
5. Render
6. Playback orchestration
7. Error handling

Regra:
- nenhuma camada deve depender de detalhes internos de outra sem interface clara

Exemplo de estrutura de configuracao:

var TEMPLATE_CONFIG = {
	meta: {
		name: 'template-base',
		version: '1.0.0'
	},
	timing: {
		totalDurationMs: 8000,
		introMs: 400,
		outroMs: 400
	},
	datasets: {
		primary: 'D_DATASET',
		optional: []
	},
	fallback: {
		title: 'Sem titulo',
		text: '',
		image: 'img/fallback.png',
		color: '#111111'
	},
	layout: {
		maxItems: 8,
		safePaddingVmin: 2
	},
	features: {
		showClock: false,
		showWeather: false,
		enableTransitions: true
	}
};

## 4.1) Catalogo de micro funcoes genericas (componivel e reutilizavel)

Referencia detalhada:
- docs/06-microfuncoes-reutilizaveis.md

Objetivo:
- quebrar logica em funcoes pequenas, testaveis e reaproveitaveis
- reduzir duplicacao entre templates
- facilitar criacao de templates novos e refatoracao

Regras para micro funcoes:
- uma responsabilidade por funcao
- assinatura simples (entrada clara, retorno claro)
- sem efeito colateral oculto
- sem dependencia de layout especifico quando puder ser generica
- nome explicito por intencao

Nucleo recomendado (usar em quase todo template):

1. Dados e validacao
- getField(item, fieldName, fallback)
- parseNumber(value, fallback)
- parseMoney(value, fallback)
- normalizeUrl(url, basePath)
- isVideoFile(url)

2. Midia e visual
- applyBackground(targetEl, mediaUrl, options)
	- verifica existencia de midia
	- detecta tipo (imagem/video)
	- aplica fallback de seguranca
- applyImage(imgEl, imageUrl, fallbackUrl)
- applyVideo(videoEl, videoUrl, options)
	- valida suporte
	- configura eventos onended/onerror/onabort/onstalled

3. Conteudo e formato
- applyText(targetEl, value, fallback)
- applyPrice(targetEl, priceValue, options)
	- normaliza monetario
	- monta parte inteira/decimal/simbolo de forma padronizada
- applyDate(targetEl, dateValue, options)
- applyClassIf(el, condition, className)

4. Fluxo e robustez
- scheduleFinish(loader, durationMs)
- finishWithError(loader, reason)
- runSafely(fn, onError)
- createWatchdog(timeoutMs, onTimeout)

5. Performance e animacao
- createDeviceProfile()
- applyPerformanceMode(profile, options)
- applyAnimationProfile(profile, rootEl)

Kit minimo obrigatorio para template novo:
- getField
- applyText
- applyBackground
- applyPrice (quando houver preco)
- scheduleFinish
- finishWithError
- runSafely

Contrato de qualidade das micro funcoes:
- entradas invalidas nao quebram template
- fallback padrao consistente
- logs de erro somente quando necessario
- comportamento deterministico em modo reduzido

Exemplos de contratos (resumo):

applyBackground(targetEl, mediaUrl, options)
- Entrada: elemento alvo, url de midia, opcoes (fallbackImage, objectFit, videoMuted)
- Saida: objeto com status { applied: true/false, mediaType: 'image'|'video'|'none' }
- Regra: nunca travar fluxo se midia falhar

applyPrice(targetEl, priceValue, options)
- Entrada: elemento alvo e valor monetario bruto
- Saida: objeto com status { applied: true/false, valueNormalized: '0.00' }
- Regra: sempre renderizar fallback monetario valido

## 5) Contrato de dados (modelo obrigatorio)

Para cada template novo, preencher:

1. Dataset principal
- nome
- obrigatorio? (sim/nao)
- cardinalidade esperada (1 item, N itens)

2. Campos obrigatorios
- nome
- tipo (string/numero/data/url)
- regra de validacao
- fallback

3. Campos opcionais
- comportamento quando ausente

4. Regras de negocio
- priorizacao
- ordenacao
- filtragem

5. Politica de erro
- quando finalizar sem loaded
- quando usar fallback visual

## 6) Pipeline operacional (da ideia ao template pronto)

1. Descoberta
- objetivo, publico, duracao, tipo de tela

2. Definicao tecnica
- contrato de dados
- wireframe funcional
- configuracoes iniciais

3. Implementacao
- estrutura HTML
- estilo responsivo
- integracao EBHTML
- normalizacao + render

4. Debug controlado
- cenarios felizes
- cenarios de erro
- cenarios limite

5. Homologacao
- validacao visual em proporcoes distintas
- validacao de playlist
- validacao de estabilidade

6. Encerramento
- checklist de pronto
- registro de licoes aprendidas

## 7) Catalogo de erros recorrentes e prevencao

### 7.1 Erros de fluxo
- Erro: esquecer loader.finished()
- Impacto: playlist travada
- Prevencao: bloco final centralizado com garantia de finalizacao

### 7.2 Erros de sucesso falso
- Erro: chamar loader.loaded() com dataset invalido
- Impacto: sinalizacao incorreta para playlist
- Prevencao: gate de sucesso unico apos validacoes

### 7.3 Erros de compatibilidade
- Erro: usar sintaxe ES6+
- Impacto: quebra no WebKit legado
- Prevencao: revisao sintatica ES5 antes de homologar

### 7.4 Erros de dados
- Erro: assumir campo sempre preenchido
- Impacto: undefined em render
- Prevencao: normalizador com fallback por campo

### 7.5 Erros visuais
- Erro: layout fixo para uma resolucao
- Impacto: sobreposicao em telas extremas
- Prevencao: testes em matriz de proporcao

### 7.8 Erros de estrutura e manutencao de UI
- Erro: excesso de classes personalizadas sem necessidade
- Impacto: CSS inchado e manutencao dificil
- Prevencao: priorizar utilitarios Tailwind raiz e justificar excecoes

### 7.9 Erros de renderizacao via JS
- Erro: montar HTML inteiro por string em JavaScript sem necessidade
- Impacto: menor legibilidade, mais risco de bug e retrabalho
- Prevencao: manter HTML semantico declarado e usar JS apenas para popular dados

### 7.10 Erros de divergencia entre runtime e preview
- Erro: preview com logica diferente do template real
- Impacto: aprovacao falsa no browser e regressao em producao
- Prevencao: pipeline unica de render com adaptador de origem de dados

### 7.6 Erros de performance em hardware antigo
- Erro: manter efeitos pesados ativos em dispositivo fraco
- Impacto: stutter, queda de fps e possivel travamento
- Prevencao: deteccao de capacidade + degradacao progressiva por niveis

### 7.7 Erros de arquitetura de performance
- Erro: regras de performance espalhadas em varios pontos
- Impacto: comportamento inconsistente e dificil manutencao
- Prevencao: funcao central de modo + classe global + flags por recurso

## 8) Stack de debug detalhada (checklists)

### 8.1 Checklist de debug tecnico

- sem erro JS no console
- datasets carregando com count esperado
- normalizacao sem undefined
- tempo de exibicao dentro do configurado
- loaded/finished executados conforme regra
- modo de performance aplicado conforme perfil de hardware
- preview.js presente e executando sem erro
- paridade funcional entre preview e runtime validada

### 8.2 Checklist de debug de dados

- campos obrigatorios presentes
- campos opcionais com fallback funcional
- formatos convertidos corretamente (numero/data)
- ordenacao e filtros aplicados conforme regra

### 8.3 Checklist de debug visual

- sem overflow nao intencional
- contraste e legibilidade adequados
- hierarquia de informacao clara
- comportamento consistente em proporcoes diferentes
- comportamento consistente entre modo normal e reduzido
- predominancia de classes Tailwind raiz na composicao visual
- estrutura semantica valida no HTML base

### 8.4 Checklist de debug de performance

- heuristica de hardware acionando nos casos esperados
- efeitos pesados desativando no modo reduzido
- loop visual adaptado (raf em forte, timeout em fraco)
- sem regressao funcional ao forcar modo reduzido

## 9) Stack de analise detalhada (matrizes)

### 9.1 Matriz requisito x implementacao

| Requisito | Status | Evidencia | Acao |
|---|---|---|---|
| Exibir titulo | OK | render principal | manter |
| Exibir imagem fallback | PENDENTE | falha em dados vazios | ajustar normalizador |
| Finalizar playlist em erro | OK | teste sem dataset | manter |

### 9.2 Matriz de risco

| Risco | Probabilidade | Impacto | Prioridade | Mitigacao |
|---|---|---|---|---|
| Dataset vazio | Alta | Alto | P1 | fallback + finish seguro |
| Texto longo | Media | Medio | P2 | truncamento e ajuste de bloco |
| ES6 acidental | Media | Alto | P1 | revisao ES5 obrigatoria |

## 10) Stack de conclusao detalhada (aceite)

Classificacao final:
- GO: todos os criterios criticos aprovados
- GO COM RISCO CONTROLADO: sem risco critico, apenas ajustes menores
- NO-GO: qualquer falha em compatibilidade, playlist ou dados criticos

Criticos para GO:
- compatibilidade ES5
- fluxo loaded/finished correto
- sem travamento com dados vazios
- leitura visual em telas alvo

## 11) Framework para criacao de agents

Objetivo:
- com poucas perguntas, gerar template funcional e pronto para uso

### 11.1 Perguntas obrigatorias (intake minimo)

1. Tipo de template
- noticia, clima, preco, comunicado, menuboard, outro

2. Dataset
- nome do dataset principal
- ha datasets secundarios?

3. Estrutura de campos
- quais campos sao obrigatorios?
- quais campos sao opcionais?

4. Regras de exibicao
- quantos itens por tela?
- ha prioridade/ordenacao/filtro?

5. Timing
- duracao total
- ha intro/outro?

6. Layout
- orientacao principal (paisagem/retrato/misto)
- visual desejado (sobrio/impacto/editorial)
- estrutura semantica planejada (header/main/section/article/footer)

7. Estrategia de markup
- o HTML base ja descreve toda estrutura principal?
- quais pontos serao somente populados por JS?
- existe alguma necessidade real de classe customizada?

8. Micro funcoes
- quais micro funcoes do nucleo serao reutilizadas?
- existe alguma micro funcao nova realmente generica para entrar no catalogo?

9. Falhas esperadas
- o que fazer sem imagem?
- o que fazer sem texto?
- o que fazer sem dataset?

10. Entrega
- precisa de componentes extras (relogio, clima, ticker)?
- precisa de variacoes de tema?

11. Perfil de hardware
- precisa detectar dispositivo fraco automaticamente?
- quais recursos podem ser desativados no modo reduzido?
- qual frequencia minima de atualizacao aceitavel no modo reduzido?
- precisa de flag para forcar modo reduzido em homologacao?

12. Video e midia
- o template usa video de fundo ou video de conteudo?
- qual fallback de imagem quando video falhar?
- existe regra de duracao/corte do video?

13. Animacoes
- qual perfil inicial (full/lite/off)?
- quais transicoes sao realmente necessarias?
- o modo reduzido desativa quais animacoes?

14. Preview
- quais campos chegam do formulario no browser?
- qual adaptador converte dados de preview para o mesmo contrato do runtime?
- qual fallback sera usado se o formulario nao enviar dados?

### 11.2 Contrato de saida do agent

Todo agent deve devolver:
- configuracao inicial do template
- HTML semantico base pronto para receber dados
- estrutura HTML base
- lista de micro funcoes reutilizadas (com assinatura)
- micro funcoes novas propostas (se houver) com justificativa de genericidade
- mapeamento de dados + normalizador
- logica de populacao de dados (evitar montagem integral de HTML por JS)
- preview.js com a mesma pipeline de render, mudando apenas a origem dos dados
- ciclo de playlist seguro
- estrategia de performance (normal/reduzido/minimo)
- estrategia de video (suporte + fallback)
- estrategia de animacao (full/lite/off)
- checklist final de validacao

### 11.3 Prompt-base para agents (modelo)

Use este bloco como referencia na criacao de novos agents:

"Crie um template EdgeContents em ES5, responsivo e compativel com WebKit legado.
Use o dataset [NOME_DATASET] com os campos [LISTA_CAMPOS].
Implemente normalizacao com fallback para campos ausentes.
Garanta loader.loaded() somente em sucesso e loader.finished() sempre.
Implemente deteccao de hardware fraco e degradacao progressiva de recursos pesados.
Se houver video, valide suporte e aplique fallback de imagem sem travar fluxo.
Implemente sistema de animacao com perfis full/lite/off e desligamento no modo reduzido.
A entrega deve conter estrutura de configuracao, render principal, tratamento de erro,
e checklist de validacao para homologacao."

## 12) Definition of Done (DoD) unificada

Tecnico:
- ES5 validado
- sem erro critico de console
- sem dependencia externa indevida
- modo reduzido funcionando quando acionado
- JS focado em dados e comportamento, sem depender de montagem massiva de HTML

Dados:
- contrato respeitado
- fallback funcional
- comportamento correto em dataset vazio

Playlist:
- loaded em sucesso
- finished sempre
- duracao aplicada

Visual:
- sem quebra em proporcoes alvo
- hierarquia clara
- legibilidade valida
- sem perda de conteudo essencial no modo reduzido
- uso predominante de utilitarios Tailwind raiz
- classes customizadas apenas quando justificadas

Markup:
- HTML semantico presente e coerente com o conteudo
- estrutura principal declarada no HTML, com JS atuando na populacao dos dados

Preview:
- preview.js implementado
- preview e runtime com paridade de comportamento
- divergencia restrita a origem de dados

Operacional:
- configuracao centralizada
- logs de debug removidos/reduzidos para producao
- licoes aprendidas registradas
- micro funcoes organizadas e reaproveitaveis entre templates

## 13) Governanca anti-retrabalho

Ao fechar cada template, registrar no proprio historico do projeto:
- o que falhou
- causa raiz
- correcao aplicada
- regra nova para evitar repeticao

Regra de melhoria continua:
- se um erro ocorrer 2 vezes, vira item obrigatorio no checklist

## 14) Resumo executivo para uso rapido

Se precisar criar um template rapido, siga esta ordem:
1. preencher intake minimo
2. fechar contrato de dados
3. gerar base com config + normalizador + render
4. validar playlist e cenarios de erro
5. homologar visual em matriz de proporcao
6. aplicar DoD e concluir

Este documento e a referencia oficial para guiar criacao de templates e de agents.

## 15) Backlog vivo de aprendizados (incremental)

Objetivo:
- receber novos pontos conforme forem lembrados
- transformar cada ponto em acao concreta
- evitar que conhecimento fique solto

Como registrar cada novo ponto:
- Contexto: em qual template/cenario aconteceu
- Sintoma: o que deu errado ou o que melhorou
- Causa raiz: por que aconteceu
- Solucao validada: o que resolveu de fato
- Generalizacao: como vira regra para qualquer template
- Impacto: estabilidade, tempo, qualidade visual, compatibilidade

Template rapido de registro:

PONTO [ID]: [titulo curto]
- Contexto:
- Sintoma:
- Causa raiz:
- Solucao validada:
- Regra gerada:
- Atualizacoes necessarias:
	- checklist:
	- prompt de agent:
	- arquitetura/config:

Triagem de prioridade:
- P0: quebra playlist, compatibilidade ES5, travamento em hardware antigo
- P1: erro funcional com dados reais ou regressao visual grave
- P2: melhoria de robustez/performance sem bloquear entrega
- P3: refinamento estetico e organizacional

Destino obrigatorio de cada aprendizado:
- se for erro recorrente: adicionar no Catalogo de erros recorrentes
- se for criterio de aceite: adicionar no DoD
- se afetar geracao automatica: atualizar intake e prompt-base de agents
- se for padrao tecnico: atualizar Stack por etapa ou Arquitetura padrao

SLA interno de consolidacao:
- ponto novo deve ser consolidado no playbook em ate 1 ciclo de revisao
- nenhum aprendizado validado fica apenas em conversa

## 16) Biblioteca oficial de mocks (pasta examples)

Objetivo:
- tratar examples como acervo oficial de cenarios reais
- acelerar criacao de mock sem inventar estrutura

Regra de uso:
- antes de criar mock novo, verificar se existe XML equivalente em examples
- manter nomes de campos alinhados ao dataset real (preferencia uppercase)
- extrair cenarios extremos dos XMLs existentes (faltas de campo, texto longo, lista vazia)

Conjuntos de referencia ja disponiveis:
- clima: D_CLIMA.xml, D_CLIMA_CLIMATEMPO.xml, D_CLIMA_CLIMATEMPO_MOMENTO.xml
- noticias/conteudo: D_UOL.xml, D_JPNEWS.xml, D_OLHOVIVO.xml, D_LOCAL.xml
- comunicados: D_COMUNICADO.xml
- esportes: D_FOOTBALL.xml, D_FOOTBALL_STANDINGS.xml, D_FOOTBALL_TEAMS.xml
- horoscopo/personare: D_HOROSCOPO.xml, D_HOROSCOPO_PERSONARE_CURTO.xml, D_PERSONARE.xml
- outros: D_CAMBIO.xml, D_AGROLINK.xml, D_AWESOMEAPI.xml, D_CONDOMINIO.xml, D_MEDSENIOR.xml

Checklist de mock robusto:
- cenario nominal
- cenario sem campo opcional
- cenario com texto grande
- cenario com lista minima
- cenario com lista maxima esperada

## 17) Achados criticos da varredura minuciosa

Padroes de alto valor para reforcar no processo:
- padrao reduced + deteccao de hardware ainda esta subutilizado fora dos templates mais recentes
- estrategia de rotacao por parametros/filtros/order no dataset reduz retrabalho e evita estado local fragil
- binary search para ajuste de fonte e mais robusto que reducao linear em hardware antigo
- watchdog de seguranca para evitar travas silenciosas e um reforco importante em templates complexos
- composicao por modulos/datasets independentes melhora manutencao e evolucao

Conflitos que precisam padronizacao continua:
- metodos diferentes de detectar hardware fraco entre templates
- controle de animacao reduzida aplicado de forma inconsistente
- abordagens diferentes para ajuste de fonte em blocos dinamicos
- uso de estado local para rotacao em casos que ja podem ser resolvidos no dataset

Diretriz de consolidacao:
- qualquer novo template deve declarar explicitamente: baseline 78, politica de video, politica de animacao e politica de fallback de dados