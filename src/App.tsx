import { AdultGateModal } from '@/components/AdultGateModal';
import { GameScreen } from '@/screens/GameScreen';
import { MixerScreen } from '@/screens/MixerScreen';
import { PlayersScreen } from '@/screens/PlayersScreen';
import { useGameStore } from '@/store/useGameStore';

export default function App() {
  const phase = useGameStore((s) => s.phase);

  return (
    <div className="app">
      {phase === 'mixer' && <MixerScreen />}
      {phase === 'players' && <PlayersScreen />}
      {phase === 'game' && <GameScreen />}
      <AdultGateModal />
    </div>
  );
}
