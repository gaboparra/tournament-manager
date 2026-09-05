import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import * as teamService from "../services/team.service.js";

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const team = await teamService.createTeam(req.userId!, req.body);
  res.status(201).json(team);
}

export async function getMine(req: AuthRequest, res: Response): Promise<void> {
  const teams = await teamService.getMyTeams(req.userId!);
  res.status(200).json(teams);
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  if (typeof id !== "string") {
    res.status(400).json({ error: "Team id is required" });
    return;
  }

  const team = await teamService.updateTeam(id, req.body);
  res.status(200).json(team);
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  if (typeof id !== "string") {
    res.status(400).json({ error: "Team id is required" });
    return;
  }

  await teamService.deleteTeam(id);
  res.status(204).send();
}

export async function addPlayer(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const { id } = req.params;

  if (typeof id !== "string") {
    res.status(400).json({ error: "Team id is required" });
    return;
  }

  const player = await teamService.addPlayer(id, req.body);
  res.status(201).json(player);
}

export async function removePlayer(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const { id, playerId } = req.params;

  if (typeof id !== "string" || typeof playerId !== "string") {
    res.status(400).json({ error: "Team id and player id are required" });
    return;
  }

  try {
    await teamService.removePlayer(id, playerId);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === "PLAYER_NOT_FOUND") {
      res.status(404).json({ error: "Player not found in this team" });
      return;
    }
    throw error;
  }
}
