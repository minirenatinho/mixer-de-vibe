import { BigButton } from './BigButton';
import { useGameStore } from '@/store/useGameStore';

export function AdultGateModal() {
  const open = useGameStore((s) => s.adultGateOpen);
  const confirmAdult = useGameStore((s) => s.confirmAdult);
  const declineAdult = useGameStore((s) => s.declineAdult);

  if (!open) return null;

  return (
    <div className="overlay overlay--center" role="dialog" aria-modal="true">
      <div className="modal modal--picancia">
        <h2>Picância no talo</h2>
        <p>
          Nesse nível entram cartas de conteúdo adulto (+18). Todo mundo na roda é maior de
          idade?
        </p>
        <BigButton variant="danger" onClick={confirmAdult}>
          Sim, todo mundo é +18
        </BigButton>
        <BigButton variant="ghost" onClick={declineAdult}>
          Melhor baixar a picância
        </BigButton>
      </div>
    </div>
  );
}
