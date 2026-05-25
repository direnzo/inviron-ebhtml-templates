# tabela_futebol

Template para exibição da tabela de grupos da Copa do Mundo 2026 (fase de grupos) para EdgeContents Digital Signage.

- Mostra um grupo por vez, alternando automaticamente
- Layout responsivo (Tailwind compatível Android 7)
- Mock de dados inspirado na tabela do Google
- Segue padrão EBHTML (loader.loaded/finished)

## Tempo de exibição

| Cenário | Intro (`D_SPD.FILE_IMAGE1`) | Conteúdo (tabela + jogos) | Total |
|---------|----------------------------|---------------------------|-------|
| Com intro | `DURACAO` segundos (campo `D_SPD`, item `CONFIG='1'`) | **5 s fixos** | intro + 5s (pode passar de 10s) |
| Sem intro | — | **10 s** | 10 s |

**Fallback** (sem `DURACAO` válido): vídeo até `ended`; imagem **5 s**.

## Estrutura dos dados
- Grupos (A, B, C...)
- Times: nome, bandeira, pontos, jogos, vitórias, empates, derrotas, gols pró, gols contra, saldo
- Exemplo de mock em js/mock-data.js

## Uso
1. `npm run dev` para compilar CSS
2. Habilite mock-data no HTML para testes locais
3. Teste em http://localhost:12099/FILES/1/index.html

Veja js/mock-data.js para estrutura detalhada dos dados.
