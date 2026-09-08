import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../auth.middleware.js";
import { prisma } from "../../config/prisma.js";

export async function requireMatchOwnership(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { id } = req.params;

  if (typeof id !== "string") {
    res.status(400).json({ error: "Match id is required" });
    return;
  }

  const match = await prisma.match.findUnique({
    where: { id },
    select: { tournament: { select: { organizerId: true } } },
  });

  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  if (match.tournament.organizerId !== req.userId) {
    res.status(403).json({ error: "Only the tournament organizer can load match results" });
    return;
  }

  next();
}
