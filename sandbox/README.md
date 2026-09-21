# Sandbox — Templates de Validação do Fluxo

Esta pasta existe para **validar o fluxo oficial** (briefing → branch temática → implementação → gates → `.eh5`), não para entregar templates de cliente.

## Regras

- Nada aqui é entrega de tenant. Não usar dados, identidade ou assets reais de cliente.
- Segue as mesmas regras técnicas do resto do repositório: ES5, EBHTML 2.0.7 copiado de `_template-base/js/ebhtml.js`, `loader.finished()` sempre, watchdog/retry quando aplicável, teste em `http://localhost:12099/FILES/1/index.html`.
- Cada cenário nasce em branch própria: `test/sandbox-<cenario>` (ver `.github/BRANCHING.md`).
- Segue o briefing e os gates de `.github/skills/edgecontents-template-workflow/SKILL.md` normalmente — só o tenant/identidade é fictício.
- Um cenário pode ser apagado depois de validado, ou mantido como fixture de regressão — decisão registrada no README do próprio cenário.

## Estrutura

```
sandbox/
├── README.md               (este arquivo)
└── <cenario>/               (um por cenário de teste, copiado de _template-base)
    ├── index.html
    ├── js/ (ebhtml.js + master.js + mock-data.js)
    ├── css/
    └── README.md            (o que este cenário valida)
```

## Cenários sugeridos (mapeados aos riscos já documentados)

| Cenário | Valida |
|---|---|
| `sandbox-dados-basicos` | `loader.load(sucesso, erro)`, `loaded/finished`, dataset simples com sucesso/vazio/erro |
| `sandbox-loader-retry` | bug de zero itens com `nodataiserror=false` (watchdog + retry, ver `ebhtml-api` seção 6) |
| `sandbox-midia-imagem-video` | handlers antes do `src`, watchdog de mídia, SVG inline via XHR, vídeo com fallback |
| `sandbox-responsivo-tipografia` | breakpoints por aspect-ratio, autofit por busca binária, body sempre visível |
| `sandbox-hardware-fraco` | detecção `HARDWARE_FRACO`, modo reduzido, animações condicionais |
| `sandbox-preview-extranet` | paridade runtime/preview quando o template exige extranet |

Nenhum cenário foi criado ainda. Ao iniciar um, siga o briefing completo da skill de workflow e crie a branch antes de copiar `_template-base`.
