import { DIMENSIONS } from './types';
import type { Card, CardType, Levels, Rng } from './types';

/**
 * Folga acima do fader que uma carta ainda pode ter, por dimensão (teto rígido).
 * Assimétrico de propósito: conteúdo mais frio que o pedido é aceitável,
 * mais quente que o conforto do grupo nunca — em especial picância, que tem folga zero.
 */
export const CEILING_SLACK: Levels = {
  acidez: 2,
  picancia: 0,
  intimidade: 1,
  exposicao: 1,
  caos: 2,
};

/** Peso de cada dimensão na distância: errar picância/intimidade incomoda mais que errar caos. */
export const DISTANCE_WEIGHTS: Levels = {
  acidez: 1,
  picancia: 1.5,
  intimidade: 1.25,
  exposicao: 1.25,
  caos: 0.75,
};

/** Temperatura do sorteio: maior = mais variedade, menor = mais colado no centro da mixagem. */
const TAU = 6;

const TYPE_WEIGHTS: Record<CardType, number> = {
  pergunta: 4,
  desafio: 4,
  todos_apontam: 2,
};

/** Nunca sortear o mesmo tipo mais de 2 vezes seguidas (se houver alternativa). */
const MAX_TYPE_STREAK = 2;

export interface DrawContext {
  levels: Levels;
  playerCount: number;
  usedIds: ReadonlySet<string>;
  lastTypes: readonly CardType[];
  rng?: Rng;
}

export function respectsCeilings(card: Card, levels: Levels): boolean {
  return DIMENSIONS.every((dim) => card.notas[dim] <= levels[dim] + CEILING_SLACK[dim]);
}

/** Distância ponderada (Manhattan) entre as notas da carta e a posição atual dos faders. */
export function mixDistance(card: Card, levels: Levels): number {
  return DIMENSIONS.reduce(
    (sum, dim) => sum + DISTANCE_WEIGHTS[dim] * Math.abs(card.notas[dim] - levels[dim]),
    0,
  );
}

export function eligibleCards(cards: readonly Card[], ctx: DrawContext): Card[] {
  return cards.filter(
    (card) =>
      !ctx.usedIds.has(card.id) &&
      card.min_jogadores <= ctx.playerCount &&
      respectsCeilings(card, ctx.levels),
  );
}

function weightedPick<T>(items: readonly T[], weightOf: (item: T) => number, rng: Rng): T | null {
  if (items.length === 0) return null;
  const weights = items.map((item) => Math.max(weightOf(item), 1e-9));
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = rng() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }
  return items[items.length - 1];
}

/** Tipo que fecharia uma sequência longa demais, ou null se não há sequência a evitar. */
function streakType(lastTypes: readonly CardType[]): CardType | null {
  if (lastTypes.length < MAX_TYPE_STREAK) return null;
  const recent = lastTypes.slice(-MAX_TYPE_STREAK);
  return recent.every((t) => t === recent[0]) ? recent[0] : null;
}

/**
 * Sorteia a próxima carta:
 * 1. filtra pelo teto de cada fader, min_jogadores e cartas já usadas;
 * 2. sorteia o tipo (pergunta/desafio/todos apontam), evitando 3 do mesmo tipo seguidas;
 * 3. dentro do tipo, sorteio ponderado por exp(-distância/τ) — leve preferência
 *    pelo centro da mixagem sem virar determinístico.
 *
 * Retorna null quando não há mais cartas compatíveis com a vibe atual.
 */
export function drawCard(cards: readonly Card[], ctx: DrawContext): Card | null {
  const rng = ctx.rng ?? Math.random;
  const pool = eligibleCards(cards, ctx);
  if (pool.length === 0) return null;

  const byType = new Map<CardType, Card[]>();
  for (const card of pool) {
    const bucket = byType.get(card.tipo) ?? [];
    bucket.push(card);
    byType.set(card.tipo, bucket);
  }

  let types = [...byType.keys()];
  const avoid = streakType(ctx.lastTypes);
  if (avoid && types.length > 1) {
    types = types.filter((t) => t !== avoid);
  }

  const tipo = weightedPick(types, (t) => TYPE_WEIGHTS[t], rng);
  if (!tipo) return null;

  return weightedPick(byType.get(tipo)!, (card) => Math.exp(-mixDistance(card, ctx.levels) / TAU), rng);
}
