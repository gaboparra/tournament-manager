import { describe, it, expect } from 'vitest';
import { generateRoundRobinMatches } from './roundRobin.js';

describe('generateRoundRobinMatches', () => {
  it('genera la cantidad correcta de partidos para 4 equipos', () => {
    const matches = generateRoundRobinMatches(['a', 'b', 'c', 'd']);

    // fórmula de combinaciones: n * (n-1) / 2
    expect(matches).toHaveLength(6);
  });

  it('cada equipo juega contra todos los demás exactamente una vez', () => {
    const teams = ['a', 'b', 'c', 'd'];
    const matches = generateRoundRobinMatches(teams);

    for (const team of teams) {
      const opponents = matches
        .filter(([home, away]) => home === team || away === team)
        .map(([home, away]) => (home === team ? away : home));

      const otherTeams = teams.filter((t) => t !== team);
      expect(opponents.sort()).toEqual(otherTeams.sort());
    }
  });

  it('no genera partidos duplicados ni invertidos', () => {
    const matches = generateRoundRobinMatches(['a', 'b', 'c']);

    const seen = new Set<string>();

    for (const [home, away] of matches) {
      const key = [home, away].sort().join('-'); // normaliza A-B y B-A al mismo key
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  it('devuelve array vacío con un solo equipo', () => {
    const matches = generateRoundRobinMatches(['a']);
    expect(matches).toHaveLength(0);
  });

  it('devuelve array vacío con cero equipos', () => {
    const matches = generateRoundRobinMatches([]);
    expect(matches).toHaveLength(0);
  });
});