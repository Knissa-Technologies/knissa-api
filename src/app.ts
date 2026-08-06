import express from "express";
import cors from "cors";

import usersRoutes from "./modules/users/routes/users.routes.js";

import { errorHandler } from "./shared/middlewares/errorHandler.js";

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
app.use(errorHandler);

app.get("/", (req, res) => {
  res.json({
    name: "Knissa API",
    version: "2.0.0",
    status: "running",
  });
});

export { app };
