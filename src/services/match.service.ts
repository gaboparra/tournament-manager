import { prisma } from "../config/prisma.js";
import type { LoadResultInput } from "../schemas/match.schema.js";

export async function loadMatchResult(matchId: string, input: LoadResultInput) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });

  if (!match) {
    throw new Error("MATCH_NOT_FOUND");
  }

  if (match.status === "FINISHED") {
    throw new Error("MATCH_ALREADY_FINISHED");
  }

  const { homeScore, awayScore } = input;

  let winnerId: string | null = null;
  if (homeScore > awayScore) winnerId = match.homeTeamId;
  else if (awayScore > homeScore) winnerId = match.awayTeamId;
  // si empatan, winnerId queda null

  await prisma.$transaction(async (tx) => {
    await tx.match.update({
      where: { id: matchId },
      data: { homeScore, awayScore, winnerId, status: "FINISHED" },
    });

    await updateTeamStats(tx, match.homeTeamId, homeScore, awayScore);
    await updateTeamStats(tx, match.awayTeamId, awayScore, homeScore);
  });

  return prisma.match.findUnique({ where: { id: matchId } });
}

async function updateTeamStats(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  tournamentTeamId: string,
  goalsFor: number,
  goalsAgainst: number,
) {
  const isWin = goalsFor > goalsAgainst;
  const isDraw = goalsFor === goalsAgainst;
  const isLoss = goalsFor < goalsAgainst;

  await tx.tournamentTeam.update({
    where: { id: tournamentTeamId },
    data: {
      played: { increment: 1 },
      wins: { increment: isWin ? 1 : 0 },
      draws: { increment: isDraw ? 1 : 0 },
      losses: { increment: isLoss ? 1 : 0 },
      goalsFor: { increment: goalsFor },
      goalsAgainst: { increment: goalsAgainst },
      points: { increment: isWin ? 3 : isDraw ? 1 : 0 },
    },
  });
}
