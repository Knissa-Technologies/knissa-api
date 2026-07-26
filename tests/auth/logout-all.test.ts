import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../src/app";
import { prisma } from "../../src/infra/database/prisma";

describe("POST /auth/logout-all", () => {
  it("should revoke all refresh tokens", async () => {
    const country = await prisma.country.findFirst({
      where: {
        isoCode: "BR",
      },
    });

    expect(country).not.toBeNull();

    // Registro
    const register = await request(app)
      .post("/auth/register")
      .send({
        firstName: "Jean",
        lastName: "Bauzil",
        email: "logoutall@test.com",
        password: "StrongPassword123!",
        phone: "+5511999999999",
        countryId: country!.id,
      });

    expect(register.status).toBe(201);

    // Login para gerar um segundo refresh token
    const login = await request(app)
      .post("/auth/login")
      .send({
        email: "logoutall@test.com",
        password: "StrongPassword123!",
      });

    expect(login.status).toBe(200);

    const accessToken = login.body.accessToken;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: {
        email: "logoutall@test.com",
      },
    });

    expect(user).not.toBeNull();

    // Logout de todos
    const response = await request(app)
      .post("/auth/logout-all")
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(response.status).toBe(204);

    const tokens = await prisma.refreshToken.findMany({
      where: {
        userId: user!.id,
      },
    });

    expect(tokens.length).toBeGreaterThanOrEqual(2);

    tokens.forEach((token) => {
      expect(token.revokedAt).not.toBeNull();
    });
  });

  it("should reject unauthenticated request", async () => {
    const response = await request(app)
      .post("/auth/logout-all");

    expect(response.status).toBe(401);
  });
});