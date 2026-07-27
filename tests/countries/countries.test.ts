import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { prisma } from "../../src/infra/database/prisma.js";

import { cleanDatabase } from "../helpers/cleanDatabase.js";
import { createAdmin } from "../helpers/createAdmin.js";

describe("Countries", () => {
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

  describe("GET /countries", () => {
    it("should list countries", async () => {
      const response = await request(app)
        .get("/countries")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      expect(response.body.data[0]).toHaveProperty("id");
      expect(response.body.data[0]).toHaveProperty("name");
      expect(response.body.data[0]).toHaveProperty("isoCode");
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).get("/countries");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Authentication required.");
    });
  });

  describe("GET /countries/:id", () => {
    it("should return a country by id", async () => {
      const country = await prisma.country.findUniqueOrThrow({
        where: {
          isoCode: "BR",
        },
      });

      const response = await request(app)
        .get(`/countries/${country.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data.id).toBe(country.id);
      expect(response.body.data.isoCode).toBe("BR");
    });

    it("should return 404 when country does not exist", async () => {
      const response = await request(app)
        .get("/countries/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Country not found.");
    });
  });

  // POST vem aqui

  // PUT vem aqui

  // DELETE vem aqui
});