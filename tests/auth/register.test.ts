import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../src/app";
import { prisma } from "../../src/infra/database/prisma";

describe("POST /auth/register", () => {
  it("should register a new user", async () => {
    const country = await prisma.country.findFirst({
      where: {
        isoCode: "BR",
      },
    });

    expect(country).not.toBeNull();

    const response = await request(app).post("/auth/register").send({
      firstName: "Jean",
      lastName: "Bauzil",
      email: "jean@test.com",
      password: "StrongPassword123!",
      phone: "+5511999999999",
      countryId: country!.id,
    });

    expect(response.status).toBe(201);

    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");
  });

  it("should reject duplicate email", async () => {
    const country = await prisma.country.findFirst({
      where: {
        isoCode: "BR",
      },
    });

    const payload = {
      firstName: "Jean",
      lastName: "Bauzil",
      email: "duplicate@test.com",
      password: "StrongPassword123!",
      phone: "+5511999999999",
      countryId: country!.id,
    };

    await request(app).post("/auth/register").send(payload);

    const response = await request(app).post("/auth/register").send(payload);

    expect(response.status).toBe(409);
  });

  it("should reject invalid payload", async () => {
    const response = await request(app).post("/auth/register").send({});

    expect(response.status).toBe(422);
  });
});
