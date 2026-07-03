import { describe, expect, it } from 'vitest';
import { drawCard, respectsCeilings, CEILING_SLACK } from './selector';
import { mulberry32 } from './rng';
import { DIMENSIONS } from './types';
import type { Card, CardType, Levels, Rng } from './types';
import { PRESETS } from './presets';
import { ALL_CARDS } from '@/data/loadCards';

const FESTA = PRESETS.find((p) => p.id === 'festa')!.levels;

const levelsOf = (partial: Partial<Levels>): Levels => ({
  acidez: 5,
  picancia: 5,
  intimidade: 5,
  exposicao: 5,
  caos: 5,
  ...partial,
});

function simulateDraws(
  levels: Levels,
  count: number,
  { playerCount = 4, seed = 42 }: { playerCount?: number; seed?: number } = {},
): Card[] {
  const rng: Rng = mulberry32(seed);
  const usedIds = new Set<string>();
  const lastTypes: CardType[] = [];
  const drawn: Card[] = [];
  for (let i = 0; i < count; i++) {
    const card = drawCard(ALL_CARDS, { levels, playerCount, usedIds, lastTypes, rng });
    if (!card) break;
    usedIds.add(card.id);
    lastTypes.push(card.tipo);
    drawn.push(card);
  }
  return drawn;
}

describe('drawCard — tetos rígidos', () => {
  it('nunca sorteia carta acima do teto de qualquer fader, em nenhum preset', () => {
    for (const preset of PRESETS) {
      const drawn = simulateDraws(preset.levels, 60, { seed: 7 });
      expect(drawn.length).toBeGreaterThan(0);
      for (const card of drawn) {
        expect(respectsCeilings(card, preset.levels), `${card.id} fura o preset ${preset.id}`).toBe(
          true,
        );
        for (const dim of DIMENSIONS) {
          expect(card.notas[dim]).toBeLessThanOrEqual(preset.levels[dim] + CEILING_SLACK[dim]);
        }
      }
    }
  });

  it('com picância no zero, só saem cartas de picância zero (folga zero)', () => {
    const drawn = simulateDraws(levelsOf({ picancia: 0 }), 40, { seed: 11 });
    expect(drawn.length).toBeGreaterThan(10);
    for (const card of drawn) {
      expect(card.notas.picancia, card.id).toBe(0);
    }
  });
});

describe('drawCard — sem repetição', () => {
  it('sorteia 40 cartas sem repetir nenhuma no preset Festa (critério do MVP)', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const drawn = simulateDraws(FESTA, 40, { seed });
      expect(drawn).toHaveLength(40);
      expect(new Set(drawn.map((c) => c.id)).size).toBe(40);
    }
  });

  it('retorna null quando todas as cartas compatíveis acabaram', () => {
    const deck: Card[] = [
      {
        id: 'x_1',
        tipo: 'pergunta',
        texto: '{jogador}, oi?',
        notas: { acidez: 0, picancia: 0, intimidade: 0, exposicao: 0, caos: 0 },
        min_jogadores: 2,
      },
    ];
    const ctx = {
      levels: levelsOf({}),
      playerCount: 4,
      usedIds: new Set(['x_1']),
      lastTypes: [] as CardType[],
      rng: mulberry32(1),
    };
    expect(drawCard(deck, ctx)).toBeNull();
  });
});

describe('drawCard — filtros e variedade', () => {
  it('respeita min_jogadores: com 2 jogadores não saem cartas de grupo', () => {
    const drawn = simulateDraws(FESTA, 40, { playerCount: 2, seed: 13 });
    for (const card of drawn) {
      expect(card.min_jogadores, card.id).toBeLessThanOrEqual(2);
    }
  });

  it('nunca emenda 3 cartas do mesmo tipo quando há alternativa', () => {
    for (const seed of [3, 17, 99]) {
      const drawn = simulateDraws(FESTA, 40, { seed });
      for (let i = 2; i < drawn.length; i++) {
        const trio = [drawn[i - 2].tipo, drawn[i - 1].tipo, drawn[i].tipo];
        expect(new Set(trio).size, `posição ${i} (seed ${seed})`).toBeGreaterThan(1);
      }
    }
  });

  it('mover os faders muda perceptivelmente o teor das cartas (critério do MVP)', () => {
    const media = (cards: Card[], dim: (typeof DIMENSIONS)[number]) =>
      cards.reduce((sum, c) => sum + c.notas[dim], 0) / cards.length;

    const intimista = simulateDraws(levelsOf({ intimidade: 10 }), 30, { seed: 21 });
    const superficial = simulateDraws(levelsOf({ intimidade: 1 }), 30, { seed: 21 });
    expect(media(intimista, 'intimidade')).toBeGreaterThan(media(superficial, 'intimidade') + 1);

    const apimentado = simulateDraws(levelsOf({ picancia: 7 }), 30, { seed: 23 });
    const inocente = simulateDraws(levelsOf({ picancia: 0 }), 30, { seed: 23 });
    expect(media(apimentado, 'picancia')).toBeGreaterThan(media(inocente, 'picancia') + 1);
  });
});
