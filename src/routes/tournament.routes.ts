import { Router } from "express";
import * as tournamentController from "../controllers/tournament.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireTournamentOwnership } from "../middlewares/ownership.middleware.js";
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

export default router;
