import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import authRoutes from "./modules/auth/routes.js";
import usersRoutes from "./modules/users/routes.js";
import walletRoutes from "./modules/wallets/routes.js";
import paymentRoutes from "./modules/payments/routes.js";
import exchangeRoutes from "./modules/exchange/routes.js";
import exchangeRateRoutes from "./modules/exchange-rates/routes.js";


import { HealthController } from "./shared/controllers/HealthController.js";
import { errorHandler } from "./shared/middlewares/errorHandler.js";

const app = express();

// ======================================================
// Security
// ======================================================

app.use(helmet());

app.use(
  cors({
    origin: [
      "http://localhost:4200",
      "http://localhost:3000",
    ],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

// ======================================================
// Swagger
// ======================================================

try {
  const swaggerDocument = YAML.load("./docs/openapi/openapi.yaml");

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument),
  );
} catch (error) {
  console.error("Swagger could not be loaded.", error);
}

// ======================================================
// Health
// ======================================================

const healthController = new HealthController();

app.get("/", (_req, res) => {
  return res.status(200).json({
    name: "Knissa API",
    version: "1.0.0",
    status: "running",
    documentation: "/api-docs",
  });
});

app.get("/health", (req, res) => {
  return healthController.handle(req, res);
});

// ======================================================
// Routes
// ======================================================

app.use("/auth", authRoutes);

app.use("/users", usersRoutes);

app.use("/wallets", walletRoutes);

app.use("/payments", paymentRoutes);

app.use("/exchange", exchangeRoutes);

app.use("/exchange-rates", exchangeRateRoutes);

// ======================================================
// Route Not Found
// ======================================================

app.use((_req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// ======================================================
// Error Handler
// ======================================================

app.use(errorHandler);

export default app;