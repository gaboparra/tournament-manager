import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import * as groupStageService from "../services/groupStage.service.js";

export async function start(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  if (typeof id !== "string") {
    res.status(400).json({ error: "Tournament id is required" });
    return;
  }

  try {
    const tournament = await groupStageService.startGroupStage(id);
    res.status(200).json(tournament);
  } catch (error) {
    if (error instanceof Error && error.message === "TOURNAMENT_NOT_FOUND") {
      res.status(404).json({ error: "Tournament not found" });
      return;
    }
    if (error instanceof Error && error.message === "ALREADY_STARTED") {
      res.status(409).json({ error: "Group stage already started for this tournament" });
      return;
    }
    if (error instanceof Error && error.message === "NOT_ENOUGH_TEAMS") {
      res.status(400).json({ error: "Not enough registered teams (minimum 2)" });
      return;
    }
    throw error;
  }
}
