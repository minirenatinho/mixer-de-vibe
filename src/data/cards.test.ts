import { describe, expect, it } from 'vitest';
import { ALL_CARDS, ALL_PENALTIES, loadCards } from './loadCards';
import baseCards from './cards.base.json';

describe('banco de cartas', () => {
  it('carrega e valida sem erros', () => {
    expect(() => loadCards()).not.toThrow();
  });

  it('tem pelo menos 120 cartas jogáveis', () => {
    expect(ALL_CARDS.length).toBeGreaterThanOrEqual(120);
  });

  it('não inclui placeholders [PREENCHER do arquivo adulto', () => {
    for (const card of ALL_CARDS) {
      expect(card.texto.startsWith('[PREENCHER'), card.id).toBe(false);
    }
  });

  it('perguntas e desafios sempre chamam o jogador pelo nome', () => {
    for (const card of ALL_CARDS) {
      if (card.tipo === 'pergunta' || card.tipo === 'desafio') {
        expect(card.texto, card.id).toContain('{jogador}');
      }
    }
  });

  it('cartas "todos apontam" exigem pelo menos 3 jogadores', () => {
    for (const card of ALL_CARDS) {
      if (card.tipo === 'todos_apontam') {
        expect(card.min_jogadores, card.id).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('o banco base fica na faixa 0–7 de picância (8–10 é o arquivo adulto)', () => {
    for (const card of baseCards) {
      expect(card.notas.picancia, card.id).toBeLessThanOrEqual(7);
    }
  });

  it('cobre as faixas altas de acidez, intimidade, exposição e caos', () => {
    expect(ALL_CARDS.some((c) => c.notas.acidez >= 8)).toBe(true);
    expect(ALL_CARDS.some((c) => c.notas.intimidade >= 9)).toBe(true);
    expect(ALL_CARDS.some((c) => c.notas.exposicao >= 9)).toBe(true);
    expect(ALL_CARDS.some((c) => c.notas.caos >= 9)).toBe(true);
  });
});

describe('banco de penalidades', () => {
  it('tem penalidades leves o suficiente para qualquer vibe', () => {
    expect(ALL_PENALTIES.length).toBeGreaterThanOrEqual(10);
    expect(ALL_PENALTIES.some((p) => p.exposicao <= 2)).toBe(true);
  });
});
