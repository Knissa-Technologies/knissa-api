import { Router } from "express";

import { UsersController } from "./controllers/UsersController.js";
import { authMiddleware } from "../../shared/middlewares/auth.js";

const usersRoutes = Router();
const usersController = new UsersController();

// Criar usuário
usersRoutes.post("/", (req, res) =>
    usersController.create(req, res)
);

// Listar usuários
usersRoutes.get("/", (req, res) =>
    usersController.list(req, res)
);

// Perfil do usuário autenticado
usersRoutes.get(
    "/me",
    authMiddleware,
    (req, res) => usersController.me(req, res)
);

export { usersRoutes };