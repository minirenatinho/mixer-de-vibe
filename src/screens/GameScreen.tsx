import { useEffect, useState } from 'react';
import { BigButton } from '@/components/BigButton';
import { CardView } from '@/components/CardView';
import { MixerPanel } from '@/components/MixerPanel';
import { VUMeter } from '@/components/VUMeter';
import { acquireWakeLock } from '@/lib/wakeLock';
import { useGameStore } from '@/store/useGameStore';

export function GameScreen() {
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const stage = useGameStore((s) => s.stage);
  const current = useGameStore((s) => s.current);
  const penalty = useGameStore((s) => s.penalty);
  const scores = useGameStore((s) => s.scores);
  const round = useGameStore((s) => s.round);
  const scoreOpen = useGameStore((s) => s.scoreOpen);
  const mixerOverlayOpen = useGameStore((s) => s.mixerOverlayOpen);

  const revealCard = useGameStore((s) => s.revealCard);
  const resolveCard = useGameStore((s) => s.resolveCard);
  const penaltyDone = useGameStore((s) => s.penaltyDone);
  const endGame = useGameStore((s) => s.endGame);
  const toggleScore = useGameStore((s) => s.toggleScore);
  const openMixerOverlay = useGameStore((s) => s.openMixerOverlay);
  const closeMixerOverlay = useGameStore((s) => s.closeMixerOverlay);

  const [confirmingEnd, setConfirmingEnd] = useState(false);

  // Celular passa de mão em mão — a tela não pode apagar no meio da rodada.
  useEffect(() => acquireWakeLock(), []);

  const currentPlayer = players[currentPlayerIndex];

  const reveal = () => {
    navigator.vibrate?.(35);
    revealCard();
  };

  const ranking = players
    .map((player, index) => ({ player, score: scores[index] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="screen game-screen">
      <header className="game-header">
        <button
          className="icon-btn"
          onClick={() => setConfirmingEnd(true)}
          aria-label="Encerrar jogo"
        >
          ✕
        </button>
        <span className="game-header__meta">Carta {round}</span>
        <div className="game-header__actions">
          <button className="icon-btn" onClick={openMixerOverlay} aria-label="Abrir mixer">
            🎛️
          </button>
          <button className="icon-btn" onClick={toggleScore} aria-label="Ver placar">
            🏆
          </button>
        </div>
      </header>

      {stage === 'pass' && (
        <div className="stage stage-pass">
          <VUMeter bars={10} />
          <p className="stage-pass__label">Passa o celular para</p>
          <h2 className="stage-pass__name">{currentPlayer}</h2>
          <BigButton onClick={reveal}>Peguei! Mostrar carta</BigButton>
        </div>
      )}

      {stage === 'card' && current && (
        <div className="stage">
          <CardView tipo={current.card.tipo} texto={current.texto} />
          <div className="btn-row">
            <BigButton variant="success" onClick={() => resolveCard('cumpriu')}>
              Cumpriu ✔
            </BigButton>
            <BigButton variant="warn" onClick={() => resolveCard('pulou')}>
              Pulou ✖
            </BigButton>
          </div>
        </div>
      )}

      {stage === 'penalty' && penalty && (
        <div className="stage">
          <article className="game-card game-card--penalidade">
            <span className="game-card__badge">Penalidade</span>
            <p className="game-card__text">{penalty.texto}</p>
            <p className="game-card__hint">Pulou, pagou. As regras são as regras.</p>
          </article>
          <BigButton onClick={penaltyDone}>Feito! Próximo 👉</BigButton>
        </div>
      )}

      {stage === 'empty' && (
        <div className="stage stage-empty">
          <p className="stage-empty__title">As cartas dessa vibe acabaram! 🎚️</p>
          <p className="text-dim text-center">
            Mexa nos faders para abrir espaço para cartas novas.
          </p>
          <BigButton onClick={openMixerOverlay}>Abrir o mixer</BigButton>
          <BigButton variant="ghost" onClick={reveal}>
            Tentar sortear de novo
          </BigButton>
        </div>
      )}

      {mixerOverlayOpen && (
        <div className="overlay" onClick={closeMixerOverlay}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h3 className="sheet__title">Ajustar a vibe</h3>
            <p className="text-dim">Vale mudar no meio do jogo — a noite evolui.</p>
            <MixerPanel />
            <BigButton variant="ghost" onClick={closeMixerOverlay}>
              Fechar mixer
            </BigButton>
          </div>
        </div>
      )}

      {scoreOpen && (
        <div className="overlay" onClick={toggleScore}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h3 className="sheet__title">Placar 🏆</h3>
            <p className="text-dim">Ponto para quem cumpre. Opcional: a zoeira já é a vitória.</p>
            <ol className="score-list">
              {ranking.map(({ player, score }, index) => (
                <li key={`${player}-${index}`}>
                  <span>{player}</span>
                  <span>{score}</span>
                </li>
              ))}
            </ol>
            <BigButton variant="ghost" onClick={toggleScore}>
              Voltar ao jogo
            </BigButton>
          </div>
        </div>
      )}

      {confirmingEnd && (
        <div className="overlay overlay--center" role="dialog" aria-modal="true">
          <div className="modal">
            <span className="modal__emoji">🛑</span>
            <h2>Encerrar o jogo?</h2>
            <p>O placar some, mas as histórias ficam.</p>
            <BigButton
              variant="danger"
              onClick={() => {
                setConfirmingEnd(false);
                endGame();
              }}
            >
              Sim, encerrar
            </BigButton>
            <BigButton variant="ghost" onClick={() => setConfirmingEnd(false)}>
              Continuar jogando
            </BigButton>
          </div>
        </div>
      )}
    </div>
  );
}
