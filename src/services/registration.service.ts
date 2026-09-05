import { prisma } from "../config/prisma.js";
import { Prisma } from "../generated/prisma/client.js";

export async function registerTeam(tournamentId: string, teamId: string) {
  try {
    return await prisma.tournamentTeam.create({
      data: { tournamentId, teamId },
      include: { team: true },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("ALREADY_REGISTERED");
    }
    throw error;
  }
}

export async function getRegistrations(tournamentId: string) {
  return prisma.tournamentTeam.findMany({
    where: { tournamentId },
    include: { team: { include: { players: true } } },
  });
}

export async function unregisterTeam(id: string) {
  await prisma.tournamentTeam.delete({ where: { id } });
}
