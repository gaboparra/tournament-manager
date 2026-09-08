import { Router } from "express";
import * as teamController from "../controllers/team.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireTeamOwnership } from "../middlewares/ownership/team.ownership.js";
import { validate } from "../middlewares/validate.js";
import {
  createTeamSchema,
  updateTeamSchema,
  addPlayerSchema,
} from "../schemas/team.schema.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createTeamSchema),
  teamController.create,
);
router.get("/mine", authenticate, teamController.getMine);

router.patch(
  "/:id",
  authenticate,
  requireTeamOwnership,
  validate(updateTeamSchema),
  teamController.update,
);
router.delete(
  "/:id",
  authenticate,
  requireTeamOwnership,
  teamController.remove,
);

router.post(
  "/:id/players",
  authenticate,
  requireTeamOwnership,
  validate(addPlayerSchema),
  teamController.addPlayer,
);
router.delete(
  "/:id/players/:playerId",
  authenticate,
  requireTeamOwnership,
  teamController.removePlayer,
);

export default router;
