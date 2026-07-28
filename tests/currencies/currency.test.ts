import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { prisma } from "../../src/infra/database/prisma.js";

import { cleanDatabase } from "../helpers/cleanDatabase.js";
import { createAdmin } from "../helpers/createAdmin.js";

describe("Currencies", () => {
  let token: string;

  beforeEach(async () => {
    await cleanDatabase();

    const country = await prisma.country.findUniqueOrThrow({
      where: {
        isoCode: "BR",
      },
    });

    const admin = await createAdmin(country.id);

    token = admin.token;
  });

  describe("GET /currencies", () => {
    it("should list currencies", async () => {
      const response = await request(app)
        .get("/currencies")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).get("/currencies");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Authentication required.");
    });
  });

  describe("GET /currencies", () => {
    it("should list currencies", async () => {
      const response = await request(app)
        .get("/currencies")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      expect(response.body[0]).toHaveProperty("id");
      expect(response.body[0]).toHaveProperty("code");
      expect(response.body[0]).toHaveProperty("name");
      expect(response.body[0]).toHaveProperty("symbol");
      expect(response.body[0]).toHaveProperty("decimals");
      expect(response.body[0]).toHaveProperty("isActive");
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).get("/currencies");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Authentication required.");
    });
  });
});
