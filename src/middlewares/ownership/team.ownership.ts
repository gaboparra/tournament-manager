import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../auth.middleware.js";
import { prisma } from "../../config/prisma.js";

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
