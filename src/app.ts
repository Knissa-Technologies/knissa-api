import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "Knissa API",
    version: "2.0.0",
    status: "running",
  });
});

export { app };