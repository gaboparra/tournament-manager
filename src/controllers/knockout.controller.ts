import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import * as knockoutService from "../services/knockout.service.js";

export async function start(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  if (typeof id !== "string") {
    res.status(400).json({ error: "Tournament id is required" });
    return;
  }

  try {
    const result = await knockoutService.startKnockoutStage(id);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "TOURNAMENT_NOT_FOUND") {
      res.status(404).json({ error: "Tournament not found" });
      return;
    }
    if (error instanceof Error && error.message === "INVALID_STATUS") {
      res.status(409).json({
        error: "Tournament must be in GROUP_STAGE to start knockout stage",
      });
      return;
    }
    if (error instanceof Error && error.message === "NOT_ENOUGH_QUALIFIERS") {
      res.status(400).json({ error: "Not enough qualified teams" });
      return;
    }
    if (error instanceof Error && error.message === "TOO_MANY_QUALIFIERS") {
      res.status(400).json({
        error: "Too many qualified teams for a single bracket (max 16)",
      });
      return;
    }
    throw error;
  }
}

export async function advance(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  if (typeof id !== "string") {
    res.status(400).json({ error: "Tournament id is required" });
    return;
  }

  try {
    const result = await knockoutService.advanceKnockoutRound(id);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "TOURNAMENT_NOT_FOUND") {
      res.status(404).json({ error: "Tournament not found" });
      return;
    }
    if (error instanceof Error && error.message === "INVALID_STATUS") {
      res.status(409).json({ error: "Tournament is not in knockout stage" });
      return;
    }
    if (error instanceof Error && error.message === "MATCHES_PENDING") {
      res.status(409).json({ error: "Current round still has unfinished matches" });
      return;
    }
    if (error instanceof Error && error.message === "NO_KNOCKOUT_MATCHES") {
      res.status(400).json({ error: "Knockout stage has not started yet" });
      return;
    }
    throw error;
  }
}
