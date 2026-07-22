import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { authRoutes } from "./modules/auth/routes.js";
import { usersRoutes } from "./modules/users/routes.js";
import { errorHandler } from "./shared/middlewares/errorHandler.js";
import walletRoutes from "./modules/wallets/routes/wallet.routes.js";

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/wallets", walletRoutes);

// Health Check
app.get("/", (_req, res) => {
  return res.json({
    name: "Knissa API",
    version: "1.0.0",
    status: "running",
  });
});

// Routes
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);

// 404
app.use((_req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// Error Handler (SEMPRE O ÚLTIMO)
app.use(errorHandler);

export default app;