import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().trim().min(2).max(50),
  logoUrl: z.url().optional(),
  players: z.array(z.object({ name: z.string().trim().min(2).max(50) })).min(1),
});

export const updateTeamSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  logoUrl: z.url().optional(),
});

export const addPlayerSchema = z.object({
  name: z.string().trim().min(2).max(50),
});

export const registerTeamSchema = z.object({
  teamId: z.string().uuid(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type AddPlayerInput = z.infer<typeof addPlayerSchema>;
export type RegisterTeamInput = z.infer<typeof registerTeamSchema>;
