import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    service: 'knissa-api',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

export default app;