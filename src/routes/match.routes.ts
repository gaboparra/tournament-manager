import { Router } from "express";
import * as matchController from "../controllers/match.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireMatchOwnership } from "../middlewares/ownership/match.ownership.js";
import { validate } from "../middlewares/validate.js";
import { loadResultSchema } from "../schemas/match.schema.js";

const router = Router();

router.patch(
  "/:id/result",
  authenticate,
  requireMatchOwnership,
  validate(loadResultSchema),
  matchController.loadResult,
);

export default router;
