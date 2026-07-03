import { useState } from 'react';
import { BigButton } from '@/components/BigButton';
import { useGameStore } from '@/store/useGameStore';

const MIN_PLAYERS = 2;

export function PlayersScreen() {
  const players = useGameStore((s) => s.players);
  const addPlayer = useGameStore((s) => s.addPlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);
  const startGame = useGameStore((s) => s.startGame);
  const backToMixer = useGameStore((s) => s.backToMixer);
  const [name, setName] = useState('');

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addPlayer(trimmed);
    setName('');
  };

  return (
    <div className="screen">
      <header className="screen-header">
        <button className="icon-btn" onClick={backToMixer} aria-label="Voltar ao mixer">
          ←
        </button>
        <h1 className="screen-title">Quem vai jogar?</h1>
      </header>

      <form
        className="player-form"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome de quem joga"
          maxLength={20}
          enterKeyHint="done"
          autoComplete="off"
        />
        <button type="submit" aria-label="Adicionar jogador">
          +
        </button>
      </form>

      <ul className="player-list">
        {players.map((player, index) => (
          <li key={`${player}-${index}`}>
            <span>{player}</span>
            <button onClick={() => removePlayer(index)} aria-label={`Remover ${player}`}>
              ✕
            </button>
          </li>
        ))}
      </ul>

      {players.length < MIN_PLAYERS && (
        <p className="text-dim text-center">
          Adicione pelo menos {MIN_PLAYERS} jogadores para começar.
        </p>
      )}

      <div className="screen-footer">
        <BigButton disabled={players.length < MIN_PLAYERS} onClick={startGame}>
          Começar o jogo 🎉
        </BigButton>
      </div>
    </div>
  );
}
