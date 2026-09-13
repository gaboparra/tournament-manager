import { prisma } from "../config/prisma.js";
import { sortByStandings } from "../utils/standings.js";

const ROUND_ORDER = [
  "ROUND_OF_16",
  "QUARTERFINAL",
  "SEMIFINAL",
  "FINAL",
] as const;
type KnockoutRoundName = (typeof ROUND_ORDER)[number];

const ROUND_SIZE: Record<KnockoutRoundName, number> = {
  ROUND_OF_16: 16,
  QUARTERFINAL: 8,
  SEMIFINAL: 4,
  FINAL: 2,
};

function bracketSizeForTeams(n: number): number {
  let size = 2;
  while (size < n) size *= 2;
  return size;
}

function roundForBracketSize(size: number): KnockoutRoundName {
  const round = ROUND_ORDER.find((r) => ROUND_SIZE[r] === size);
  if (!round) {
    throw new Error("TOO_MANY_QUALIFIERS");
  }
  return round;
}

interface Seedable {
  id: string;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
}

// arma los partidos de una ronda (mejor semilla vs peor semilla), persistiendo byes como partidos auto-finalizados
async function createRoundMatches(
  tournamentId: string,
  round: KnockoutRoundName,
  seeded: Seedable[],
) {
  const bracketSize = bracketSizeForTeams(seeded.length);
  const byesCount = bracketSize - seeded.length;
  const byeTeams = seeded.slice(0, byesCount);
  const playingTeams = seeded.slice(byesCount);

  const pairs: Array<{ homeTeamId: string; awayTeamId: string }> = [];
  for (let i = 0; i < playingTeams.length / 2; i++) {
    const home = playingTeams[i];
    const away = playingTeams[playingTeams.length - 1 - i];
    if (!home || !away) continue;
    pairs.push({ homeTeamId: home.id, awayTeamId: away.id });
  }

  await prisma.$transaction(async (tx) => {
    await tx.match.createMany({
      data: pairs.map((pair) => ({
        tournamentId,
        phase: "KNOCKOUT",
        round,
        homeTeamId: pair.homeTeamId,
        awayTeamId: pair.awayTeamId,
      })),
    });

    // los byes se guardan como partido sin rival, ya finalizado
    if (byeTeams.length > 0) {
      await tx.match.createMany({
        data: byeTeams.map((team) => ({
          tournamentId,
          phase: "KNOCKOUT",
          round,
          homeTeamId: team.id,
          winnerId: team.id,
          status: "FINISHED",
        })),
      });
    }
  });
}

export async function startKnockoutStage(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      groups: { include: { registrations: { include: { team: true } } } },
    },
  });

  if (!tournament) {
    throw new Error("TOURNAMENT_NOT_FOUND");
  }

  if (tournament.status !== "GROUP_STAGE") {
    throw new Error("INVALID_STATUS");
  }

  const qualifiers = tournament.groups.flatMap((group) =>
    sortByStandings(group.registrations).slice(
      0,
      tournament.qualifiersPerGroup,
    ),
  );

  if (qualifiers.length < 2) {
    throw new Error("NOT_ENOUGH_QUALIFIERS");
  }

  const seeded = sortByStandings(qualifiers);
  const bracketSize = bracketSizeForTeams(seeded.length);
  const round = roundForBracketSize(bracketSize); // valida <= 16, lanza TOO_MANY_QUALIFIERS si no

  await createRoundMatches(tournamentId, round, seeded);

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { status: "KNOCKOUT_STAGE" },
  });

  return getKnockoutBracket(tournamentId);
}

export async function advanceKnockoutRound(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
  });

  if (!tournament) {
    throw new Error("TOURNAMENT_NOT_FOUND");
  }

  if (tournament.status !== "KNOCKOUT_STAGE") {
    throw new Error("INVALID_STATUS");
  }

  const knockoutMatches = await prisma.match.findMany({
    where: { tournamentId, phase: "KNOCKOUT" },
    include: { winner: true },
    orderBy: { createdAt: "desc" },
  });

  const currentRound = knockoutMatches[0]?.round;
  if (!currentRound) {
    throw new Error("NO_KNOCKOUT_MATCHES");
  }

  const currentRoundMatches = knockoutMatches.filter(
    (m) => m.round === currentRound,
  );
  const pending = currentRoundMatches.some((m) => m.status !== "FINISHED");

  if (pending) {
    throw new Error("MATCHES_PENDING");
  }

  if (currentRound === "FINAL") {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: "FINISHED" },
    });
    return {
      finished: true,
      championId: currentRoundMatches[0]?.winnerId ?? null,
    };
  }

  const winners = await prisma.tournamentTeam.findMany({
    where: {
      id: {
        in: currentRoundMatches
          .map((m) => m.winnerId)
          .filter((id): id is string => !!id),
      },
    },
  });

  const seeded = sortByStandings(winners);
  const nextRoundIndex = ROUND_ORDER.indexOf(currentRound) + 1;
  const nextRound = ROUND_ORDER[nextRoundIndex];

  if (!nextRound) {
    throw new Error("TOO_MANY_QUALIFIERS");
  }

  await createRoundMatches(tournamentId, nextRound, seeded);

  return getKnockoutBracket(tournamentId);
}

export async function getKnockoutBracket(tournamentId: string) {
  return prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      matches: {
        where: { phase: "KNOCKOUT" },
        include: {
          homeTeam: { include: { team: true } },
          awayTeam: { include: { team: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
