import { createClient } from "redis";

export const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.connect();

redis.on("error", (err: Error) => {
  console.error("Redis Error:", err);
});