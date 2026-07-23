import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { authRoutes } from "./modules/auth/routes.js";
import { usersRoutes } from "./modules/users/routes.js";

import walletRoutes from "./modules/wallets/routes/wallet.routes.js";
import exchangeRateRoutes from "./modules/exchange-rates/routes/exchange-rate.routes.js";
import paymentRoutes from "./modules/payments/routes/payment.routes.js";
import exchangeRoutes from "./modules/exchange/routes/exchange.routes.js";

import { errorHandler } from "./shared/middlewares/errorHandler.js";

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/wallets", walletRoutes);
app.use("/exchange-rates", exchangeRateRoutes);
app.use("/payments", paymentRoutes);
app.use("/exchange", exchangeRoutes);

// Health Check
app.get("/", (_req, res) => {
  return res.json({
    name: "Knissa API",
    version: "1.0.0",
    status: "running",
  });
});

// 404
app.use((_req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// Error Handler (sempre o último)
app.use(errorHandler);

export default app;