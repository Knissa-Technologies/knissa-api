import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { prisma } from "../../src/infra/database/prisma";

describe("GET /wallets", () => {
  it("should return the authenticated user's wallets", async () => {
    const country = await prisma.country.findFirst({
      where: {
        isoCode: "BR",
      },
    });

    expect(country).not.toBeNull();

    const register = await request(app)
      .post("/auth/register")
      .send({
        firstName: "Jean",
        lastName: "Bauzil",
        email: `wallet-${Date.now()}@test.com`,
        phone: "+5511999999999",
        password: "StrongPassword123!",
        countryId: country!.id,
      });

    expect(register.status).toBe(201);

    const accessToken = register.body.accessToken;

    const response = await request(app)
      .get("/wallets")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(Array.isArray(response.body.data)).toBe(true);

    expect(response.body.data.length).toBeGreaterThan(0);

    expect(response.body.data[0]).toHaveProperty("id");
    expect(response.body.data[0]).toHaveProperty("accountNumber");
    expect(response.body.data[0]).toHaveProperty("balance");
    expect(response.body.data[0]).toHaveProperty("currency");
  });

  it("should return 401 without authentication", async () => {
    const response = await request(app).get("/wallets");

    expect(response.status).toBe(401);
  });
});
