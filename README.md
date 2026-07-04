# Mixer de Vibe

Party game em português brasileiro para jogar com **um único celular** passando de mão em mão.
O app sorteia perguntas absurdas, desafios e cartas de "todos apontam" — e o **Mixer de Vibe**
(5 faders: acidez, picância, intimidade, exposição e caos) controla o teor do que sai,
do almoço de família à madrugada entre íntimos.

- **PWA offline-first**: instala no celular e funciona 100% sem internet após o primeiro acesso
- **Sem backend, sem contas**: todo o estado é local
- **Banco de cartas em JSON**: adicionar cartas = editar um arquivo ([guia](src/data/README.md))

## Rodando local

```bash
npm install
npm run dev        # servidor de desenvolvimento
npm test           # testes da engine de sorteio
npm run build      # type-check + build de produção em dist/
npm run preview    # serve o build (para testar o service worker)
```

## Como funciona o sorteio

Cada carta tem notas de 0 a 10 nas 5 dimensões. O sorteio ([selector.ts](src/engine/selector.ts)):

1. **Tetos rígidos** — nenhuma carta sai com nota acima do fader correspondente
   (picância tem folga zero; as outras dimensões, 1–2 pontos);
2. **Proximidade** — sorteio ponderado por `exp(-distância/τ)`, com leve preferência
   pelo centro da mixagem atual;
3. **Sem repetição** na sessão, e nunca 3 cartas do mesmo tipo seguidas.

Se a picância passar de 6, o app pede confirmação de que todos são maiores de 18.

## Conteúdo +18

O banco base cobre picância 0–7. As cartas explícitas (8–10) ficam em
[`src/data/cards.adulto.json`](src/data/cards.adulto.json), que vem como esqueleto com
marcadores `[PREENCHER: ...]` — preencha os textos você mesmo e elas entram no jogo
automaticamente. Instruções em [src/data/README.md](src/data/README.md).

## Deploy

Push na branch `main` dispara o workflow de GitHub Pages
([.github/workflows/deploy.yml](.github/workflows/deploy.yml)): roda os testes, builda e
publica em `https://<usuario>.github.io/mixer-de-vibe/`.

## Fora do escopo do MVP (mas com arquitetura preparada)

Geração de cartas via LLM, multiplayer em rede, contas/ranking, modo verdade-ou-desafio
com escolha, outros idiomas e cartas customizadas pelo jogador. A separação
dados (`src/data`) / engine pura (`src/engine`) / UI (`src/screens`, `src/components`)
deixa tudo isso plugável.
