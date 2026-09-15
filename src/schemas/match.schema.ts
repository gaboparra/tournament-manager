import { z } from "zod";

export const loadResultSchema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
});

export const scheduleMatchSchema = z.object({
  scheduledAt: z.coerce.date(),
});

export const updateLiveScoreSchema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
});

export type LoadResultInput = z.infer<typeof loadResultSchema>;
export type ScheduleMatchInput = z.infer<typeof scheduleMatchSchema>;
export type UpdateLiveScoreInput = z.infer<typeof updateLiveScoreSchema>;
