import { Router } from "express";
import * as registrationController from "../controllers/registration.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireTeamOwnershipForRegistration } from "../middlewares/ownership/team.ownership.js";
import { requireRegistrationOwnership } from "../middlewares/ownership/registration.ownership.js";
import { validate } from "../middlewares/validate.js";
import { registerTeamSchema } from "../schemas/team.schema.js";

const router = Router();

router.post(
  "/tournaments/:tournamentId/registrations",
  authenticate,
  validate(registerTeamSchema),
  requireTeamOwnershipForRegistration,
  registrationController.register,
);
router.get(
  "/tournaments/:tournamentId/registrations",
  registrationController.getAll,
);
router.delete(
  "/registrations/:id",
  authenticate,
  requireRegistrationOwnership,
  registrationController.remove,
);

export default router;
