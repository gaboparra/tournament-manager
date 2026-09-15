import { prisma } from "../config/prisma.js";
import type {
  LoadResultInput,
  ScheduleMatchInput,
  UpdateLiveScoreInput,
} from "../schemas/match.schema.js";
import { getSocketServer } from "../config/socket.js";

export async function loadMatchResult(matchId: string, input: LoadResultInput) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });

  if (!match) {
    throw new Error("MATCH_NOT_FOUND");
  }

  if (match.status === "FINISHED") {
    throw new Error("MATCH_ALREADY_FINISHED");
  }

  const { awayTeamId } = match;

  if (!awayTeamId) {
    throw new Error("MATCH_HAS_NO_OPPONENT");
  }

  const { homeScore, awayScore } = input;

  let winnerId: string | null = null;
  if (homeScore > awayScore) winnerId = match.homeTeamId;
  else if (awayScore > homeScore) winnerId = awayTeamId;

  await prisma.$transaction(async (tx) => {
    await tx.match.update({
      where: { id: matchId },
      data: { homeScore, awayScore, winnerId, status: "FINISHED" },
    });

    await updateTeamStats(tx, match.homeTeamId, homeScore, awayScore);
    await updateTeamStats(tx, awayTeamId, awayScore, homeScore);
  });

  const updatedMatch = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      homeTeam: { include: { team: true } },
      awayTeam: { include: { team: true } },
    },
  });

  getSocketServer()
    .to(`tournament:${match.tournamentId}`)
    .emit("match-result", updatedMatch);

  return updatedMatch;
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

export async function getMatchesByTournament(tournamentId: string) {
  return prisma.match.findMany({
    where: { tournamentId },
    include: {
      homeTeam: { include: { team: true } },
      awayTeam: { include: { team: true } },
    },
    orderBy: [{ phase: "asc" }, { createdAt: "asc" }],
  });
}

export async function scheduleMatch(
  matchId: string,
  input: ScheduleMatchInput,
) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });

  if (!match) {
    throw new Error("MATCH_NOT_FOUND");
  }

  return prisma.match.update({
    where: { id: matchId },
    data: { scheduledAt: input.scheduledAt },
  });
}

export async function startMatch(matchId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });

  if (!match) {
    throw new Error("MATCH_NOT_FOUND");
  }

  if (match.status !== "SCHEDULED") {
    throw new Error("INVALID_MATCH_STATUS");
  }

  const updatedMatch = await prisma.match.update({
    where: { id: matchId },
    data: { status: "IN_PROGRESS", homeScore: 0, awayScore: 0 },
  });

  getSocketServer()
    .to(`tournament:${match.tournamentId}`)
    .emit("match-started", updatedMatch);

  return updatedMatch;
}

export async function updateLiveScore(
  matchId: string,
  input: UpdateLiveScoreInput,
) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });

  if (!match) {
    throw new Error("MATCH_NOT_FOUND");
  }

  if (match.status !== "IN_PROGRESS") {
    throw new Error("MATCH_NOT_IN_PROGRESS");
  }

  const updatedMatch = await prisma.match.update({
    where: { id: matchId },
    data: { homeScore: input.homeScore, awayScore: input.awayScore },
  });

  getSocketServer()
    .to(`tournament:${match.tournamentId}`)
    .emit("live-score-update", updatedMatch);

  return updatedMatch;
}
