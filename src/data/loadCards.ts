import { CARD_TYPES, DIMENSIONS } from '@/engine/types';
import type { Card, Penalty } from '@/engine/types';
import baseCards from './cards.base.json';
import adultCards from './cards.adulto.json';
import penaltiesData from './penalties.json';

/**
 * Cartas cujo texto começa com este marcador ainda não foram escritas
 * (esqueleto +18 em cards.adulto.json) e são ignoradas pelo jogo.
 */
const PLACEHOLDER_PREFIX = '[PREENCHER';

function assertCard(raw: unknown, index: number, source: string): asserts raw is Card {
  const fail = (motivo: string): never => {
    throw new Error(`Carta inválida em ${source} (posição ${index}): ${motivo}`);
  };
  if (typeof raw !== 'object' || raw === null) fail('não é um objeto');
  const card = raw as Record<string, unknown>;
  if (typeof card.id !== 'string' || card.id.length === 0) fail('campo "id" ausente ou vazio');
  if (!CARD_TYPES.includes(card.tipo as never)) {
    fail(`campo "tipo" deve ser um de: ${CARD_TYPES.join(', ')}`);
  }
  if (typeof card.texto !== 'string' || card.texto.trim().length === 0) {
    fail('campo "texto" ausente ou vazio');
  }
  if (typeof card.min_jogadores !== 'number' || card.min_jogadores < 1) {
    fail('campo "min_jogadores" deve ser um número >= 1');
  }
  if (typeof card.notas !== 'object' || card.notas === null) fail('campo "notas" ausente');
  const notas = card.notas as Record<string, unknown>;
  for (const dim of DIMENSIONS) {
    const valor = notas[dim];
    if (typeof valor !== 'number' || valor < 0 || valor > 10) {
      fail(`nota "${dim}" deve ser um número entre 0 e 10`);
    }
  }
}

function parseCards(raw: unknown[], source: string): Card[] {
  const cards: Card[] = [];
  raw.forEach((entry, index) => {
    assertCard(entry, index, source);
    if (entry.texto.startsWith(PLACEHOLDER_PREFIX)) return; // ainda não preenchida
    cards.push(entry);
  });
  return cards;
}

/** Todas as cartas jogáveis: banco base + cartas +18 já preenchidas. */
export function loadCards(): Card[] {
  const cards = [
    ...parseCards(baseCards as unknown[], 'cards.base.json'),
    ...parseCards(adultCards as unknown[], 'cards.adulto.json'),
  ];
  const ids = new Set<string>();
  for (const card of cards) {
    if (ids.has(card.id)) {
      throw new Error(`ID de carta duplicado: "${card.id}" — cada carta precisa de um id único`);
    }
    ids.add(card.id);
  }
  return cards;
}

export function loadPenalties(): Penalty[] {
  return (penaltiesData as unknown[]).map((raw, index) => {
    const fail = (motivo: string): never => {
      throw new Error(`Penalidade inválida em penalties.json (posição ${index}): ${motivo}`);
    };
    const p = raw as Record<string, unknown>;
    if (typeof p.id !== 'string' || p.id.length === 0) fail('campo "id" ausente ou vazio');
    if (typeof p.texto !== 'string' || p.texto.trim().length === 0) fail('campo "texto" ausente');
    if (typeof p.exposicao !== 'number' || p.exposicao < 0 || p.exposicao > 10) {
      fail('campo "exposicao" deve ser um número entre 0 e 10');
    }
    return p as unknown as Penalty;
  });
}

export const ALL_CARDS: Card[] = loadCards();
export const ALL_PENALTIES: Penalty[] = loadPenalties();
