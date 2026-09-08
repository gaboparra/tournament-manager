import { prisma } from "../config/prisma.js";
import { generateRoundRobinMatches } from "../utils/roundRobin.js";

const GROUP_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j] as T;
    result[j] = temp as T;
  }
  return result;
}

function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export async function startGroupStage(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { registrations: true },
  });

  if (!tournament) {
    throw new Error("TOURNAMENT_NOT_FOUND");
  }

  if (tournament.status !== "DRAFT") {
    throw new Error("ALREADY_STARTED");
  }

  if (tournament.registrations.length < 2) {
    throw new Error("NOT_ENOUGH_TEAMS");
  }

  const shuffledTeams = shuffle(tournament.registrations);
  const groupsOfTeams = chunk(shuffledTeams, tournament.groupSize);

  await prisma.$transaction(async (tx) => {
    for (const [index, teamsInGroup] of groupsOfTeams.entries()) {
      const group = await tx.group.create({
        data: {
          name: `Grupo ${GROUP_LETTERS[index] ?? String(index + 1)}`,
          tournamentId,
        },
      });

      await tx.tournamentTeam.updateMany({
        where: {
          id: { in: teamsInGroup.map((registration) => registration.id) },
        },
        data: { groupId: group.id },
      });

      const pairings = generateRoundRobinMatches(
        teamsInGroup.map((registration) => registration.id),
      );

      await tx.match.createMany({
        data: pairings.map(([homeTeamId, awayTeamId]) => ({
          tournamentId,
          groupId: group.id,
          phase: "GROUP",
          homeTeamId,
          awayTeamId,
        })),
      });
    }

    await tx.tournament.update({
      where: { id: tournamentId },
      data: { status: "GROUP_STAGE" },
    });
  });

  return prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      groups: {
        include: { registrations: { include: { team: true } }, matches: true },
      },
    },
  });
}
