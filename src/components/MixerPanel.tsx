import { Fader } from './Fader';
import { DIMENSIONS, DIMENSION_LABELS } from '@/engine/types';
import type { Dimension } from '@/engine/types';
import { useGameStore } from '@/store/useGameStore';

const DIMENSION_COLORS: Record<Dimension, string> = {
  acidez: 'var(--c-acidez)',
  picancia: 'var(--c-picancia)',
  intimidade: 'var(--c-intimidade)',
  exposicao: 'var(--c-exposicao)',
  caos: 'var(--c-caos)',
};

/** Os 5 faders ligados ao store — usado na tela inicial e no overlay durante o jogo. */
export function MixerPanel() {
  const levels = useGameStore((s) => s.levels);
  const setLevel = useGameStore((s) => s.setLevel);

  return (
    <div className="mixer-panel">
      {DIMENSIONS.map((dim) => (
        <Fader
          key={dim}
          label={DIMENSION_LABELS[dim]}
          color={DIMENSION_COLORS[dim]}
          value={levels[dim]}
          onChange={(value) => setLevel(dim, value)}
        />
      ))}
    </div>
  );
}
