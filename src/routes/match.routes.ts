import { Router } from "express";
import * as matchController from "../controllers/match.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireMatchOwnership } from "../middlewares/ownership/match.ownership.js";
import { validate } from "../middlewares/validate.js";
import {
  loadResultSchema,
  scheduleMatchSchema,
  updateLiveScoreSchema,
} from "../schemas/match.schema.js";

const router = Router();

router.patch(
  "/matches/:id/result",
  authenticate,
  requireMatchOwnership,
  validate(loadResultSchema),
  matchController.loadResult,
);
router.get("/tournaments/:tournamentId/matches", matchController.getAll);
router.patch(
  "/matches/:id/schedule",
  authenticate,
  requireMatchOwnership,
  validate(scheduleMatchSchema),
  matchController.schedule,
);
router.patch(
  "/matches/:id/start",
  authenticate,
  requireMatchOwnership,
  matchController.start,
);
router.patch(
  "/matches/:id/live-score",
  authenticate,
  requireMatchOwnership,
  validate(updateLiveScoreSchema),
  matchController.updateLiveScore,
);

export default router;
