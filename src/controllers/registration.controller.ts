import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import * as registrationService from "../services/registration.service.js";

export async function register(req: AuthRequest, res: Response): Promise<void> {
  const { tournamentId } = req.params;
  const { teamId } = req.body;

  if (typeof tournamentId !== "string") {
    res.status(400).json({ error: "Tournament id is required" });
    return;
  }

  try {
    const registration = await registrationService.registerTeam(
      tournamentId,
      teamId,
    );
    res.status(201).json(registration);
  } catch (error) {
    if (error instanceof Error && error.message === "ALREADY_REGISTERED") {
      res.status(409).json({ error: "This team is already registered in this tournament" });
      return;
    }
    throw error;
  }
}

export async function getAll(req: AuthRequest, res: Response): Promise<void> {
  const { tournamentId } = req.params;

  if (typeof tournamentId !== "string") {
    res.status(400).json({ error: "Tournament id is required" });
    return;
  }

  const registrations = await registrationService.getRegistrations(tournamentId);
  res.status(200).json(registrations);
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  if (typeof id !== "string") {
    res.status(400).json({ error: "Registration id is required" });
    return;
  }

  await registrationService.unregisterTeam(id);
  res.status(204).send();
}
