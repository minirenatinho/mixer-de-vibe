# Banco de cartas

Todo o conteúdo do jogo mora nesta pasta, em JSON puro — **para adicionar ou editar cartas
você não precisa mexer em nenhum código**.

| Arquivo | O que é |
|---|---|
| `cards.base.json` | Banco principal (~120 cartas, picância 0–7) |
| `cards.adulto.json` | Cartas +18 explícitas (picância 8–10) — **você preenche** |
| `penalties.json` | Penalidades leves para quem pula uma carta |

## Formato de uma carta

```json
{
  "id": "q_042",
  "tipo": "pergunta",
  "texto": "{jogador}, se sua vida tivesse uma trilha sonora de brega, qual seria a música do seu momento mais dramático?",
  "notas": { "acidez": 3, "picancia": 0, "intimidade": 4, "exposicao": 2, "caos": 6 },
  "min_jogadores": 2
}
```

- **`id`** — único no banco inteiro. Convenção: `q_` pergunta, `d_` desafio, `t_` todos apontam, `adulto_` para as +18.
- **`tipo`** — `"pergunta"`, `"desafio"` ou `"todos_apontam"`.
- **`texto`** — placeholders disponíveis:
  - `{jogador}` → nome do jogador da vez;
  - `{outro_jogador}` → outro participante sorteado (nunca o da vez).
  - Cartas `todos_apontam` normalmente não usam placeholder (a pergunta é para a roda toda).
- **`notas`** — de 0 a 10 em cada dimensão. É isso que o mixer usa para filtrar:
  o jogo **nunca** sorteia uma carta com nota acima do fader correspondente
  (picância tem tolerância zero; as outras dimensões têm 1–2 pontos de folga).
- **`min_jogadores`** — use `3` se o texto fala de "sala"/grupo ou usa `{outro_jogador}` em cena coletiva.

## Como preencher as cartas +18 (`cards.adulto.json`)

As entradas vêm com `"texto": "[PREENCHER: ...]"`. Enquanto o texto começar com
`[PREENCHER`, a carta é **ignorada pelo jogo** — então o app funciona normalmente antes
de você editá-las. Para ativar uma carta:

1. Troque o texto pelo conteúdo final (mantenha `{jogador}` onde fizer sentido);
2. Ajuste as `notas` (essas cartas devem ter `picancia` entre 8 e 10);
3. Salve. Pronto — sem build especial, sem tocar em código.

Você também pode duplicar entradas para criar quantas quiser (lembre de trocar o `id`).

## Validação

O loader (`loadCards.ts`) valida tudo ao iniciar o app e nos testes. Se um campo estiver
faltando ou fora da faixa, o erro diz **qual arquivo e qual posição** está com problema.
Rode `npm test` depois de editar para conferir.

## Penalidades

```json
{ "id": "pen_001", "texto": "Fale com sotaque de outra região até sua próxima vez.", "exposicao": 3 }
```

Só têm a dimensão `exposicao` (0–10) — o sorteio respeita o fader de exposição.
Penalidades podem se repetir na sessão (o banco é pequeno de propósito).
