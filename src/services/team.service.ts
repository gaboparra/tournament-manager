import { prisma } from "../config/prisma.js";
import type {
  CreateTeamInput,
  UpdateTeamInput,
  AddPlayerInput,
} from "../schemas/team.schema.js";

export async function createTeam(ownerId: string, input: CreateTeamInput) {
  return prisma.team.create({
    data: {
      name: input.name,
      logoUrl: input.logoUrl,
      ownerId,
      players: {
        create: input.players,
      },
    },
    include: { players: true },
  });
}

export async function getMyTeams(ownerId: string) {
  return prisma.team.findMany({
    where: { ownerId },
    include: { players: true },
  });
}

export async function updateTeam(id: string, input: UpdateTeamInput) {
  return prisma.team.update({
    where: { id },
    data: input,
  });
}

export async function deleteTeam(id: string) {
  await prisma.team.delete({ where: { id } });
}

export async function addPlayer(teamId: string, input: AddPlayerInput) {
  return prisma.player.create({
    data: { name: input.name, teamId },
  });
}

export async function removePlayer(teamId: string, playerId: string) {
  const player = await prisma.player.findUnique({ where: { id: playerId } });

  if (!player || player.teamId !== teamId) {
    throw new Error("PLAYER_NOT_FOUND");
  }

  await prisma.player.delete({ where: { id: playerId } });
}
