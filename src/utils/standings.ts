interface StandingsStats {
  points: number;
  goalsFor: number;
  goalsAgainst: number;
}

export function sortByStandings<T extends StandingsStats>(teams: T[]): T[] {
  return [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;

    const goalDiffA = a.goalsFor - a.goalsAgainst;
    const goalDiffB = b.goalsFor - b.goalsAgainst;
    if (goalDiffB !== goalDiffA) return goalDiffB - goalDiffA;

    return b.goalsFor - a.goalsFor;
  });
}
