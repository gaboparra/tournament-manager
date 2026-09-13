import { z } from "zod";

export const loadResultSchema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
});

export const scheduleMatchSchema = z.object({
  scheduledAt: z.coerce.date(),
});

export type LoadResultInput = z.infer<typeof loadResultSchema>;
export type ScheduleMatchInput = z.infer<typeof scheduleMatchSchema>;
