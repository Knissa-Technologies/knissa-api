import express from "express";
import cors from "cors";

import usersRoutes from "./modules/users/routes/users.routes.js";

import { errorHandler } from "./shared/middlewares/errorHandler.js";

import authRoutes from "./modules/auth/routes/auth.routes.js";

import profilesRoutes from "./modules/profiles/routes/profiles.routes.js";
import accountsRoutes from "./modules/accounts/routes/accounts.routes.js";
import walletsRoutes from "./modules/wallets/routes/wallets.routes.js";
import transactionsRoutes from "./modules/transactions/routes/transactions.routes.js";
import recipientsRoutes from "./modules/recipients/routes/recipients.routes.js";
import paymentsRoutes from "./modules/payments/routes/payments.routes.js";
import paymentLinksRoutes from "./modules/payment-links/routes/payment-links.routes.js";
import exchangeRoutes from "./modules/exchange/routes/exchange.routes.js";
import { exchangeRatesRoutes } from "./modules/exchange-rates/routes/exchange-rates.routes.js";
import complianceRoutes from "./modules/compliance/routes/compliance.routes.js";
import merchantsRoutes from "./modules/merchants/routes/merchants.routes.js";
import notificationsRoutes from "./modules/notifications/routes/notifications.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/users-test", (req, res) => {
  res.json({
    success: true,
    message: "Direct route works 🚀",
  });
});

app.use("/users", usersRoutes);
app.use("/auth", authRoutes);
app.use("/profiles", profilesRoutes);
app.use("/accounts", accountsRoutes);
app.use("/wallets", walletsRoutes);
app.use("/transactions", transactionsRoutes);
app.use("/recipients", recipientsRoutes);
app.use("/payments", paymentsRoutes);
app.use("/payment-links", paymentLinksRoutes);
app.use("/exchange", exchangeRoutes);
app.use("/exchange-rates", exchangeRatesRoutes);
app.use("/compliance", complianceRoutes);
app.use("/merchants", merchantsRoutes);
app.use("/notifications", notificationsRoutes);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.json({
    name: "Knissa API",
    version: "2.0.0",
    status: "running",
  });
});

export { app };
