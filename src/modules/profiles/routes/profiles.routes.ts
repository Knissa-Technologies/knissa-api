import { Router } from "express";

import { ProfilesController } from "../controllers/ProfilesController.js";

import { authMiddleware } from "../../../shared/middlewares/authMiddleware.js";

const router = Router();

const profilesController = new ProfilesController();

router.use(authMiddleware);

// ======================================================
// CURRENT USER PROFILE
// ======================================================

router.get(
  "/me",
  (req, res) =>
    profilesController.findMe(req, res),
);

router.patch(
  "/me",
  (req, res) =>
    profilesController.updateMe(req, res),
);

export default router;