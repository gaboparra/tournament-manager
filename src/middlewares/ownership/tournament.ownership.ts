import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../auth.middleware.js";
import { prisma } from "../../config/prisma.js";

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
