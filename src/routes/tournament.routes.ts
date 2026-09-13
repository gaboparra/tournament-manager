import { Router } from "express";
import * as tournamentController from "../controllers/tournament.controller.js";
import * as groupStageController from "../controllers/groupStage.controller.js";
import * as knockoutController from "../controllers/knockout.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireTournamentOwnership } from "../middlewares/ownership/tournament.ownership.js";
import { validate } from "../middlewares/validate.js";
import {
  createTournamentSchema,
  updateTournamentSchema,
} from "../schemas/tournament.schema.js";

const router = Router();

router.get("/", tournamentController.getAll);
router.get("/:id", tournamentController.getById);
router.post(
  "/",
  authenticate,
  validate(createTournamentSchema),
  tournamentController.create,
);
router.patch(
  "/:id",
  authenticate,
  requireTournamentOwnership,
  validate(updateTournamentSchema),
  tournamentController.update,
);
router.delete(
  "/:id",
  authenticate,
  requireTournamentOwnership,
  tournamentController.remove,
);
router.post(
  "/:id/group-stage/start",
  authenticate,
  requireTournamentOwnership,
  groupStageController.start,
);
router.post(
  "/:id/start-knockout-stage",
  authenticate,
  requireTournamentOwnership,
  knockoutController.start,
);
router.post(
  "/:id/advance-knockout-round",
  authenticate,
  requireTournamentOwnership,
  knockoutController.advance,
);

export default router;
