import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../src/app";
import { prisma } from "../../src/infra/database/prisma";

describe("POST /auth/refresh", () => {
  it("should refresh access and refresh tokens", async () => {
    const country = await prisma.country.findFirst({
      where: {
        isoCode: "BR",
      },
    });

    expect(country).not.toBeNull();

    const register = await request(app).post("/auth/register").send({
      firstName: "Jean",
      lastName: "Bauzil",
      email: "refresh@test.com",
      password: "StrongPassword123!",
      phone: "+5511999999999",
      countryId: country!.id,
    });

    expect(register.status).toBe(201);

    const refreshToken = register.body.refreshToken;

    const response = await request(app)
      .post("/auth/refresh")
      .send({
        refreshToken,
      });

    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");

    expect(response.body.refreshToken).not.toBe(refreshToken);
  });

  it("should reject invalid refresh token", async () => {
    const response = await request(app)
      .post("/auth/refresh")
      .send({
        refreshToken: "invalid-token",
      });

    expect(response.status).toBe(401);
  });

  it("should reject invalid payload", async () => {
    const response = await request(app)
      .post("/auth/refresh")
      .send({});

    expect(response.status).toBe(422);
  });
});