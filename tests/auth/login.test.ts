import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../src/app";
import { prisma } from "../../src/infra/database/prisma";

describe("POST /auth/login", () => {
  it("should login successfully", async () => {
    const country = await prisma.country.findFirst({
      where: {
        isoCode: "BR",
      },
    });

    expect(country).not.toBeNull();

    const payload = {
      firstName: "Jean",
      lastName: "Bauzil",
      email: "login@test.com",
      password: "StrongPassword123!",
      phone: "+5511999999999",
      countryId: country!.id,
    };

    await request(app).post("/auth/register").send(payload);

    const response = await request(app).post("/auth/login").send({
      email: payload.email,
      password: payload.password,
    });

    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");
  });

  it("should reject wrong password", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "login@test.com",
      password: "WrongPassword123!",
    });

    expect(response.status).toBe(401);
  });

  it("should reject unknown email", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "unknown@test.com",
      password: "StrongPassword123!",
    });

    expect(response.status).toBe(401);
  });

  it("should reject invalid payload", async () => {
    const response = await request(app).post("/auth/login").send({});

    expect(response.status).toBe(422);
  });
});