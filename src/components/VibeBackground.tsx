import { DIMENSIONS } from '@/engine/types';
import { useGameStore } from '@/store/useGameStore';

/**
 * Fundo ambiente que reage à mixagem: cada dimensão projeta um brilho da sua
 * cor em um canto da tela, com intensidade proporcional ao fader correspondente.
 * Mixagem calma = fundo quase preto; tudo no talo = neon por todo lado.
 */
export function VibeBackground() {
  const levels = useGameStore((s) => s.levels);

  return (
    <div className="vibe-bg" aria-hidden="true">
      {DIMENSIONS.map((dim) => (
        <div
          key={dim}
          className={`vibe-bg__blob vibe-bg__blob--${dim}`}
          style={{ opacity: levels[dim] / 10 }}
        />
      ))}
    </div>
  );
}
