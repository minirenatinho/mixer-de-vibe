import type { Levels } from './types';

export interface Preset {
  id: string;
  nome: string;
  levels: Levels;
}

/** Posições iniciais dos faders — sempre ajustáveis manualmente depois. */
export const PRESETS: Preset[] = [
  {
    id: 'familia',
    nome: 'Família',
    levels: { acidez: 3, picancia: 0, intimidade: 2, exposicao: 4, caos: 5 },
  },
  {
    id: 'trabalho',
    nome: 'Trabalho',
    levels: { acidez: 4, picancia: 1, intimidade: 2, exposicao: 4, caos: 4 },
  },
  {
    id: 'festa',
    nome: 'Festa',
    levels: { acidez: 6, picancia: 5, intimidade: 5, exposicao: 7, caos: 7 },
  },
  {
    id: 'madrugada',
    nome: 'Madrugada entre íntimos',
    levels: { acidez: 7, picancia: 8, intimidade: 9, exposicao: 8, caos: 6 },
  },
];

export const DEFAULT_LEVELS: Levels = PRESETS[2].levels; // Festa

/** Picância a partir deste valor exige confirmação de que todos são 18+. */
export const ADULT_THRESHOLD = 6;
