import { z } from "zod";

export const loadResultSchema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
});

export type LoadResultInput = z.infer<typeof loadResultSchema>;
