import { CARD_TYPE_LABELS } from '@/engine/types';
import type { CardType } from '@/engine/types';

const TYPE_CLASS: Record<CardType, string> = {
  pergunta: 'pergunta',
  desafio: 'desafio',
  todos_apontam: 'todos',
};

interface CardViewProps {
  tipo: CardType;
  texto: string;
}

export function CardView({ tipo, texto }: CardViewProps) {
  return (
    <article className={`game-card game-card--${TYPE_CLASS[tipo]}`}>
      <span className="game-card__badge">{CARD_TYPE_LABELS[tipo]}</span>
      <p className="game-card__text">{texto}</p>
      {tipo === 'todos_apontam' && (
        <p className="game-card__hint">Leia em voz alta. No três… todo mundo aponta para alguém!</p>
      )}
    </article>
  );
}
