import { PRESETS } from '@/engine/presets';
import { DIMENSIONS } from '@/engine/types';
import type { Levels } from '@/engine/types';
import { useGameStore } from '@/store/useGameStore';

const sameLevels = (a: Levels, b: Levels) => DIMENSIONS.every((dim) => a[dim] === b[dim]);

export function PresetChips() {
  const levels = useGameStore((s) => s.levels);
  const applyPreset = useGameStore((s) => s.applyPreset);

  return (
    <div className="preset-chips">
      {PRESETS.map((preset) => (
        <button
          key={preset.id}
          className={`preset-chip${sameLevels(levels, preset.levels) ? ' preset-chip--active' : ''}`}
          onClick={() => applyPreset(preset.levels)}
        >
          {preset.nome}
        </button>
      ))}
    </div>
  );
}
