import { describe, expect, it } from 'vitest';
import { drawPenalty, interpolateCardText, nextPlayerIndex } from './session';
import { mulberry32 } from './rng';
import type { Levels, Penalty } from './types';

const PLAYERS = ['Renato', 'Bia', 'Cadu', 'Duda'];

const levelsOf = (exposicao: number): Levels => ({
  acidez: 5,
  picancia: 5,
  intimidade: 5,
  exposicao,
  caos: 5,
});

describe('interpolateCardText', () => {
  it('substitui {jogador} pelo jogador da vez', () => {
    const texto = interpolateCardText('{jogador}, conta aí. Vai, {jogador}!', PLAYERS, 1);
    expect(texto).toBe('Bia, conta aí. Vai, Bia!');
  });

  it('{outro_jogador} nunca é o jogador da vez', () => {
    for (let seed = 0; seed < 50; seed++) {
      const texto = interpolateCardText(
        '{jogador}, elogie {outro_jogador}.',
        PLAYERS,
        2,
        mulberry32(seed),
      );
      expect(texto.startsWith('Cadu')).toBe(true);
      expect(texto).not.toContain('{outro_jogador}');
      expect(texto.slice(5)).not.toContain('Cadu');
    }
  });

  it('com 2 jogadores, {outro_jogador} é sempre o outro', () => {
    const texto = interpolateCardText(
      '{jogador} e {outro_jogador}',
      ['Ana', 'Beto'],
      0,
      mulberry32(9),
    );
    expect(texto).toBe('Ana e Beto');
  });
});

describe('nextPlayerIndex', () => {
  it('roda em círculo pela lista de jogadores', () => {
    expect(nextPlayerIndex(0, 4)).toBe(1);
    expect(nextPlayerIndex(3, 4)).toBe(0);
    expect(nextPlayerIndex(0, 2)).toBe(1);
    expect(nextPlayerIndex(1, 2)).toBe(0);
  });
});

describe('drawPenalty', () => {
  const penalties: Penalty[] = [
    { id: 'pen_a', texto: 'leve', exposicao: 1 },
    { id: 'pen_b', texto: 'média', exposicao: 5 },
    { id: 'pen_c', texto: 'pesada', exposicao: 9 },
  ];

  it('respeita o fader de exposição (com folga de 2)', () => {
    for (let seed = 0; seed < 30; seed++) {
      const penalty = drawPenalty(penalties, levelsOf(1), mulberry32(seed));
      expect(penalty).not.toBeNull();
      expect(penalty!.exposicao).toBeLessThanOrEqual(3);
    }
  });

  it('se todas passam do teto, cai nas mais mansas em vez de travar', () => {
    const pesadas: Penalty[] = [
      { id: 'pen_x', texto: 'pesada', exposicao: 8 },
      { id: 'pen_y', texto: 'pesadíssima', exposicao: 10 },
    ];
    const penalty = drawPenalty(pesadas, levelsOf(0), mulberry32(3));
    expect(penalty?.id).toBe('pen_x');
  });

  it('retorna null só com banco vazio', () => {
    expect(drawPenalty([], levelsOf(5), mulberry32(1))).toBeNull();
  });
});
