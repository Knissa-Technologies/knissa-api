import { prisma } from "../database/prisma.js";
import { redis } from "../database/redis.js";

export class HealthService {
  async check() {
    const startedAt = Date.now();

    let database = "disconnected";
    let redisStatus = "disconnected";

    try {
      await prisma.$queryRaw`SELECT 1`;
      database = "connected";
    } catch {}

    try {
      await redis.ping();
      redisStatus = "connected";
    } catch {}

    return {
      status:
        database === "connected" && redisStatus === "connected"
          ? "ok"
          : "degraded",

      service: "Knissa API",
      version: "1.0.0",
      environment: process.env.NODE_ENV ?? "development",

      database,
      redis: redisStatus,

      uptime: process.uptime(),

      responseTime: `${Date.now() - startedAt}ms`,

      timestamp: new Date().toISOString(),
    };
  }
}