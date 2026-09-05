import { z } from "zod";

export const createTournamentSchema = z.object({
  name: z.string().trim().min(3).max(100),
  groupSize: z.number().int().min(2).max(16).default(4),
  qualifiersPerGroup: z.number().int().min(1).max(4).default(2),
});

export const updateTournamentSchema = createTournamentSchema.partial();

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
export type UpdateTournamentInput = z.infer<typeof updateTournamentSchema>;
