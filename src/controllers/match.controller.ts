import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import * as matchService from "../services/match.service.js";

export async function loadResult(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const { id } = req.params;

  if (typeof id !== "string") {
    res.status(400).json({ error: "Match id is required" });
    return;
  }

  try {
    const match = await matchService.loadMatchResult(id, req.body);
    res.status(200).json(match);
  } catch (error) {
    if (error instanceof Error && error.message === "MATCH_NOT_FOUND") {
      res.status(404).json({ error: "Match not found" });
      return;
    }
    if (error instanceof Error && error.message === "MATCH_ALREADY_FINISHED") {
      res.status(409).json({ error: "This match result was already loaded" });
      return;
    }
    throw error;
  }
}
