import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../auth.middleware.js";
import { prisma } from "../../config/prisma.js";

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
