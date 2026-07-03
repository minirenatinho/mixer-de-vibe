import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { drawCard } from '@/engine/selector';
import { drawPenalty, interpolateCardText, nextPlayerIndex } from '@/engine/session';
import { ADULT_THRESHOLD, DEFAULT_LEVELS } from '@/engine/presets';
import { ALL_CARDS, ALL_PENALTIES } from '@/data/loadCards';
import type { Card, CardType, Dimension, Levels, Penalty } from '@/engine/types';

export type Phase = 'mixer' | 'players' | 'game';
export type TurnStage = 'pass' | 'card' | 'penalty' | 'empty';

export interface CurrentCard {
  card: Card;
  /** Texto já com os nomes interpolados. */
  texto: string;
}

interface GameStore {
  phase: Phase;
  levels: Levels;
  players: string[];
  /** Confirmação 18+ vale para a sessão atual (não é persistida). */
  adultConfirmed: boolean;
  adultGateOpen: boolean;
  pendingStart: boolean;
  mixerOverlayOpen: boolean;
  scoreOpen: boolean;

  stage: TurnStage;
  currentPlayerIndex: number;
  usedIds: string[];
  lastTypes: CardType[];
  scores: number[];
  round: number;
  current: CurrentCard | null;
  penalty: Penalty | null;

  setLevel: (dim: Dimension, value: number) => void;
  applyPreset: (levels: Levels) => void;
  goToPlayers: () => void;
  backToMixer: () => void;
  addPlayer: (name: string) => void;
  removePlayer: (index: number) => void;
  startGame: () => void;
  beginSession: () => void;
  confirmAdult: () => void;
  declineAdult: () => void;
  revealCard: () => void;
  resolveCard: (resultado: 'cumpriu' | 'pulou') => void;
  penaltyDone: () => void;
  advanceTurn: () => void;
  endGame: () => void;
  toggleScore: () => void;
  openMixerOverlay: () => void;
  closeMixerOverlay: () => void;
}

const needsAdultGate = (levels: Levels, confirmed: boolean) =>
  levels.picancia >= ADULT_THRESHOLD && !confirmed;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      phase: 'mixer',
      levels: { ...DEFAULT_LEVELS },
      players: [],
      adultConfirmed: false,
      adultGateOpen: false,
      pendingStart: false,
      mixerOverlayOpen: false,
      scoreOpen: false,

      stage: 'pass',
      currentPlayerIndex: 0,
      usedIds: [],
      lastTypes: [],
      scores: [],
      round: 1,
      current: null,
      penalty: null,

      setLevel: (dim, value) =>
        set((s) => ({ levels: { ...s.levels, [dim]: value } })),

      applyPreset: (levels) => set({ levels: { ...levels } }),

      goToPlayers: () => set({ phase: 'players' }),
      backToMixer: () => set({ phase: 'mixer' }),

      addPlayer: (name) => set((s) => ({ players: [...s.players, name] })),
      removePlayer: (index) =>
        set((s) => ({ players: s.players.filter((_, i) => i !== index) })),

      startGame: () => {
        const s = get();
        if (s.players.length < 2) return;
        if (needsAdultGate(s.levels, s.adultConfirmed)) {
          set({ adultGateOpen: true, pendingStart: true });
          return;
        }
        get().beginSession();
      },

      beginSession: () =>
        set((s) => ({
          phase: 'game',
          stage: 'pass',
          currentPlayerIndex: 0,
          usedIds: [],
          lastTypes: [],
          scores: s.players.map(() => 0),
          round: 1,
          current: null,
          penalty: null,
          scoreOpen: false,
          mixerOverlayOpen: false,
        })),

      confirmAdult: () => {
        const wasPending = get().pendingStart;
        set({ adultConfirmed: true, adultGateOpen: false, pendingStart: false });
        if (wasPending) get().beginSession();
      },

      declineAdult: () => {
        const wasPending = get().pendingStart;
        set((s) => ({
          levels: { ...s.levels, picancia: ADULT_THRESHOLD - 1 },
          adultGateOpen: false,
          pendingStart: false,
        }));
        if (wasPending) get().beginSession();
      },

      revealCard: () => {
        const s = get();
        const card = drawCard(ALL_CARDS, {
          levels: s.levels,
          playerCount: s.players.length,
          usedIds: new Set(s.usedIds),
          lastTypes: s.lastTypes,
        });
        if (!card) {
          set({ stage: 'empty', current: null });
          return;
        }
        const texto = interpolateCardText(card.texto, s.players, s.currentPlayerIndex);
        set({
          stage: 'card',
          current: { card, texto },
          usedIds: [...s.usedIds, card.id],
          lastTypes: [...s.lastTypes.slice(-4), card.tipo],
        });
      },

      resolveCard: (resultado) => {
        const s = get();
        if (resultado === 'cumpriu') {
          const scores = [...s.scores];
          scores[s.currentPlayerIndex] = (scores[s.currentPlayerIndex] ?? 0) + 1;
          set({ scores });
          get().advanceTurn();
          return;
        }
        const penalty = drawPenalty(ALL_PENALTIES, s.levels);
        if (!penalty) {
          get().advanceTurn();
          return;
        }
        set({ stage: 'penalty', penalty });
      },

      penaltyDone: () => {
        set({ penalty: null });
        get().advanceTurn();
      },

      advanceTurn: () =>
        set((s) => ({
          stage: 'pass',
          current: null,
          penalty: null,
          currentPlayerIndex: nextPlayerIndex(s.currentPlayerIndex, s.players.length),
          round: s.round + 1,
        })),

      endGame: () =>
        set({
          phase: 'mixer',
          stage: 'pass',
          current: null,
          penalty: null,
          scoreOpen: false,
          mixerOverlayOpen: false,
        }),

      toggleScore: () => set((s) => ({ scoreOpen: !s.scoreOpen })),

      openMixerOverlay: () => set({ mixerOverlayOpen: true }),

      closeMixerOverlay: () => {
        const s = get();
        if (needsAdultGate(s.levels, s.adultConfirmed)) {
          set({ adultGateOpen: true, mixerOverlayOpen: false });
          return;
        }
        set({ mixerOverlayOpen: false });
      },
    }),
    {
      name: 'mixer-de-vibe',
      partialize: (s) => ({ levels: s.levels, players: s.players }),
    },
  ),
);
