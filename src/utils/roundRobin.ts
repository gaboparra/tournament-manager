export function generateRoundRobinMatches(
  teamIds: string[],
): Array<[string, string]> {
  const matches: Array<[string, string]> = [];

  teamIds.forEach((homeTeamId, i) => {
    teamIds.slice(i + 1).forEach((awayTeamId) => {
      matches.push([homeTeamId, awayTeamId]);
    });
  });

  return matches;
}
