import type { Levels, Penalty, Rng } from './types';

/**
 * Substitui {jogador} pelo jogador da vez e {outro_jogador} por outro
 * participante sorteado (nunca o jogador da vez).
 */
export function interpolateCardText(
  texto: string,
  players: readonly string[],
  currentIndex: number,
  rng: Rng = Math.random,
): string {
  const current = players[currentIndex];
  let out = texto.split('{jogador}').join(current);
  if (out.includes('{outro_jogador}')) {
    const others = players.filter((_, i) => i !== currentIndex);
    const other = others[Math.floor(rng() * others.length)] ?? current;
    out = out.split('{outro_jogador}').join(other);
  }
  return out;
}

export function nextPlayerIndex(currentIndex: number, playerCount: number): number {
  return (currentIndex + 1) % playerCount;
}

/**
 * Sorteia uma penalidade leve para quem pulou, respeitando o fader de exposição
 * (com 2 de folga). Se a vibe estiver baixa demais, cai nas penalidades mais mansas.
 * Penalidades podem repetir na sessão — o banco é pequeno de propósito.
 */
export function drawPenalty(
  penalties: readonly Penalty[],
  levels: Levels,
  rng: Rng = Math.random,
): Penalty | null {
  if (penalties.length === 0) return null;
  let pool = penalties.filter((p) => p.exposicao <= levels.exposicao + 2);
  if (pool.length === 0) {
    const minExposicao = Math.min(...penalties.map((p) => p.exposicao));
    pool = penalties.filter((p) => p.exposicao === minExposicao);
  }
  return pool[Math.floor(rng() * pool.length)];
}
