import type { CSSProperties } from 'react';

/** VU meter puramente decorativo — barrinhas dançando em loop, dessincronizadas. */
export function VUMeter({ bars = 12 }: { bars?: number }) {
  return (
    <div className="vu" aria-hidden="true">
      {Array.from({ length: bars }, (_, i) => (
        <i
          key={i}
          style={
            {
              '--d': `${-((i * 137) % 700)}ms`,
              '--dur': `${520 + ((i * 97) % 380)}ms`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
