import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../src/app";
import { prisma } from "../../src/infra/database/prisma";

describe("POST /auth/logout", () => {
  it("should revoke refresh token", async () => {
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
        email: "logout@test.com",
        password: "StrongPassword123!",
        phone: "+5511999999999",
        countryId: country!.id,
      });

    expect(register.status).toBe(201);

    const refreshToken = register.body.refreshToken;

    const response = await request(app)
      .post("/auth/logout")
      .send({
        refreshToken,
      });

    expect(response.status).toBe(204);

    const tokens = await prisma.refreshToken.findMany();

    expect(tokens).toHaveLength(1);
    expect(tokens[0].revokedAt).not.toBeNull();
  });

  it("should reject invalid payload", async () => {
    const response = await request(app)
      .post("/auth/logout")
      .send({});

    expect(response.status).toBe(422);
  });
});