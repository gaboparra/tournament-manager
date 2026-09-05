import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import * as tournamentService from "../services/tournament.service.js";

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const tournament = await tournamentService.createTournament(
    req.userId!,
    req.body,
  );
  res.status(201).json(tournament);
}

export async function getAll(_req: AuthRequest, res: Response): Promise<void> {
  const tournaments = await tournamentService.getAllTournaments();
  res.status(200).json(tournaments);
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  if (typeof id !== "string") {
    res.status(400).json({ error: "Tournament id is required" });
    return;
  }

  try {
    const tournament = await tournamentService.getTournamentById(id);
    res.status(200).json(tournament);
  } catch (error) {
    if (error instanceof Error && error.message === "TOURNAMENT_NOT_FOUND") {
      res.status(404).json({ error: "Tournament not found" });
      return;
    }
    throw error;
  }
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  if (typeof id !== "string") {
    res.status(400).json({ error: "Tournament id is required" });
    return;
  }

  const tournament = await tournamentService.updateTournament(id, req.body);
  res.status(200).json(tournament);
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  if (typeof id !== "string") {
    res.status(400).json({ error: "Tournament id is required" });
    return;
  }

  await tournamentService.deleteTournament(id);
  res.status(204).send();
}
