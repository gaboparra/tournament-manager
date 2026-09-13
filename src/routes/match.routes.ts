import { Router } from "express";
import * as matchController from "../controllers/match.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireMatchOwnership } from "../middlewares/ownership/match.ownership.js";
import { validate } from "../middlewares/validate.js";
import {
  loadResultSchema,
  scheduleMatchSchema,
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

export default router;
