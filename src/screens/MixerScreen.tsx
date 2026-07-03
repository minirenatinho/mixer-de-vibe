import { BigButton } from '@/components/BigButton';
import { MixerPanel } from '@/components/MixerPanel';
import { PresetChips } from '@/components/PresetChips';
import { VUMeter } from '@/components/VUMeter';
import { useGameStore } from '@/store/useGameStore';

export function MixerScreen() {
  const goToPlayers = useGameStore((s) => s.goToPlayers);

  return (
    <div className="screen">
      <header className="brand">
        <VUMeter bars={14} />
        <h1 className="brand__title">Mixer de Vibe</h1>
        <p className="brand__tagline">Ajusta a mesa, passa o celular, paga o mico.</p>
      </header>

      <PresetChips />

      <section className="mixer-board">
        <MixerPanel />
      </section>

      <p className="text-dim text-center hint">
        Os faders controlam o teor das cartas — do almoço de domingo à madrugada.
      </p>

      <BigButton onClick={goToPlayers}>Escolher jogadores →</BigButton>
    </div>
  );
}
