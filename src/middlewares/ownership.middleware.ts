import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./auth.middleware.js";
import { prisma } from "../config/prisma.js";

export async function requireTournamentOwnership(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { id } = req.params;

  if (typeof id !== "string") {
    res.status(400).json({ error: "Tournament id is required" });
    return;
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    select: { organizerId: true },
  });

  if (!tournament) {
    res.status(404).json({ error: "Tournament not found" });
    return;
  }

  if (tournament.organizerId !== req.userId) {
    res.status(403).json({ error: "You do not have permission to modify this tournament" });
    return;
  }

  next();
}

// export async function requireTournamentOwnershipForTeamCreation(
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction,
// ): Promise<void> {
//   const { tournamentId } = req.params;

//   if (typeof tournamentId !== "string") {
//     res.status(400).json({ error: "Tournament id is required" });
//     return;
//   }

//   const tournament = await prisma.tournament.findUnique({
//     where: { id: tournamentId },
//     select: { organizerId: true },
//   });

//   if (!tournament) {
//     res.status(404).json({ error: "Tournament not found" });
//     return;
//   }

//   if (tournament.organizerId !== req.userId) {
//     res.status(403).json({ error: "You do not have permission to modify this tournament" });
//     return;
//   }

//   next();
// }

export async function requireTeamOwnership(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { id } = req.params;

  if (typeof id !== "string") {
    res.status(400).json({ error: "Team id is required" });
    return;
  }

  const team = await prisma.team.findUnique({
    where: { id },
    select: { ownerId: true },
  });

  if (!team) {
    res.status(404).json({ error: "Team not found" });
    return;
  }

  if (team.ownerId !== req.userId) {
    res.status(403).json({ error: "You do not have permission to modify this team" });
    return;
  }

  next();
}

export async function requireTeamOwnershipForRegistration(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { teamId } = req.body;

  if (typeof teamId !== "string") {
    res.status(400).json({ error: "Team id is required" });
    return;
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { ownerId: true },
  });

  if (!team) {
    res.status(404).json({ error: "Team not found" });
    return;
  }

  if (team.ownerId !== req.userId) {
    res.status(403).json({ error: "You can only register teams you own" });
    return;
  }

  next();
}

export async function requireRegistrationOwnership(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { id } = req.params;

  if (typeof id !== "string") {
    res.status(400).json({ error: "Registration id is required" });
    return;
  }

  const registration = await prisma.tournamentTeam.findUnique({
    where: { id },
    select: { team: { select: { ownerId: true } } },
  });

  if (!registration) {
    res.status(404).json({ error: "Registration not found" });
    return;
  }

  if (registration.team.ownerId !== req.userId) {
    res.status(403).json({ error: "You can only withdraw teams you own" });
    return;
  }

  next();
}
