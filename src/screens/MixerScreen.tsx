import { BigButton } from '@/components/BigButton';
import { MixerPanel } from '@/components/MixerPanel';
import { PresetChips } from '@/components/PresetChips';
import { DIMENSIONS } from '@/engine/types';
import { useGameStore } from '@/store/useGameStore';

export function MixerScreen() {
  const goToPlayers = useGameStore((s) => s.goToPlayers);

  return (
    <div className="screen">
      <header className="brand">
        <h1 className="brand__title">Mixer de Vibe</h1>
        <span className="brand__leds" aria-hidden="true">
          {DIMENSIONS.map((dim) => (
            <i key={dim} style={{ background: `var(--c-${dim})` }} />
          ))}
        </span>
        <p className="brand__tagline">Faça um remix do rolê com perguntas e desafios ao seu modo.</p>
      </header>

      <PresetChips />

      <section className="mixer-board">
        <MixerPanel />
      </section>

      <p className="text-dim text-center hint">
        Os faders controlam o teor das cartas. Do almoço de domingo ao after insalubre.
      </p>

      <BigButton onClick={goToPlayers}>Escolher jogadores</BigButton>
    </div>
  );
}
