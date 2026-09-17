import { describe, it, expect } from 'vitest';
import { sortByStandings } from './standings.js';

describe('sortByStandings', () => {
  it('ordena por puntos de mayor a menor', () => {
    const teams = [
      { id: 'a', points: 3, goalsFor: 2, goalsAgainst: 1 },
      { id: 'b', points: 6, goalsFor: 1, goalsAgainst: 0 },
    ];

    const result = sortByStandings(teams);

    expect(result[0]?.id).toBe('b');
    expect(result[1]?.id).toBe('a');
  });

  it('desempata por diferencia de gol cuando los puntos son iguales', () => {
    const teams = [
      { id: 'a', points: 6, goalsFor: 4, goalsAgainst: 3 }, // diff +1
      { id: 'b', points: 6, goalsFor: 5, goalsAgainst: 2 }, // diff +3
    ];

    const result = sortByStandings(teams);

    expect(result[0]?.id).toBe('b');
  });

  it('desempata por goles a favor cuando puntos y diferencia de gol son iguales', () => {
    const teams = [
      { id: 'a', points: 6, goalsFor: 5, goalsAgainst: 4 }, // diff +1, GF 5
      { id: 'b', points: 6, goalsFor: 6, goalsAgainst: 5 }, // diff +1, GF 6
    ];

    const result = sortByStandings(teams);

    expect(result[0]?.id).toBe('b');
  });

  it('no muta el array original', () => {
    const teams = [
      { id: 'a', points: 3, goalsFor: 1, goalsAgainst: 0 },
      { id: 'b', points: 6, goalsFor: 1, goalsAgainst: 0 },
    ];
    const original = [...teams];

    sortByStandings(teams);

    expect(teams).toEqual(original);
  });
});