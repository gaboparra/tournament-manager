import { prisma } from "../config/prisma.js";
import type {
  CreateTournamentInput,
  UpdateTournamentInput,
} from "../schemas/tournament.schema.js";

export async function createTournament(
  organizerId: string,
  input: CreateTournamentInput,
) {
  return prisma.tournament.create({
    data: {
      ...input,
      organizerId,
    },
  });
}

export async function getAllTournaments() {
  return prisma.tournament.findMany({
    include: {
      organizer: { select: { id: true, name: true } },
      _count: { select: { registrations: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTournamentById(id: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      organizer: { select: { id: true, name: true } },
      registrations: { include: { team: true } },
      groups: true,
    },
  });

  if (!tournament) {
    throw new Error("TOURNAMENT_NOT_FOUND");
  }

  return tournament;
}

export async function updateTournament(
  id: string,
  input: UpdateTournamentInput,
) {
  return prisma.tournament.update({
    where: { id },
    data: input,
  });
}

export async function deleteTournament(id: string) {
  await prisma.tournament.delete({ where: { id } });
}
