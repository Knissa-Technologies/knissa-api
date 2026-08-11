import { Router } from "express";

import { UsersController } from "../controllers/UsersController.js";
import { authMiddleware } from "../../../shared/middlewares/authMiddleware.js";

const router = Router();

const usersController = new UsersController();

router.use(authMiddleware);

router.get("/", (req, res) => usersController.findAll(req, res));

router.get("/:id", (req, res) => usersController.findById(req, res));

router.patch("/:id", (req, res) => usersController.update(req, res));

router.delete("/:id", (req, res) => usersController.delete(req, res));

export default router;
