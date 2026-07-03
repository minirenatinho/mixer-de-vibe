/** As 5 dimensões do Mixer de Vibe. Chaves sem acento para casar com o JSON de cartas. */
export const DIMENSIONS = ['acidez', 'picancia', 'intimidade', 'exposicao', 'caos'] as const;

export type Dimension = (typeof DIMENSIONS)[number];

/** Valores de 0 a 10 por dimensão — usado tanto para faders quanto para notas de carta. */
export type Levels = Record<Dimension, number>;

export const DIMENSION_LABELS: Record<Dimension, string> = {
  acidez: 'Acidez',
  picancia: 'Picância',
  intimidade: 'Intimidade',
  exposicao: 'Exposição',
  caos: 'Caos',
};

export const CARD_TYPES = ['pergunta', 'desafio', 'todos_apontam'] as const;

export type CardType = (typeof CARD_TYPES)[number];

export const CARD_TYPE_LABELS: Record<CardType, string> = {
  pergunta: 'Pergunta',
  desafio: 'Desafio',
  todos_apontam: 'Todos apontam',
};

export interface Card {
  id: string;
  tipo: CardType;
  /** Pode conter {jogador} (jogador da vez) e {outro_jogador} (outro participante sorteado). */
  texto: string;
  notas: Levels;
  min_jogadores: number;
}

/** Penalidade leve sorteada quando alguém pula uma carta. */
export interface Penalty {
  id: string;
  texto: string;
  /** 0–10: quão vergonhosa é. Filtrada pelo fader de exposição. */
  exposicao: number;
}

/** Gerador de números aleatórios em [0, 1). Injetável para testes determinísticos. */
export type Rng = () => number;
