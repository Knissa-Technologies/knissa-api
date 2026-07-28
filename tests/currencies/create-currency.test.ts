import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { prisma } from "../../src/infra/database/prisma.js";

import { cleanDatabase } from "../helpers/cleanDatabase.js";
import { createAdmin } from "../helpers/createAdmin.js";

describe("POST /currencies", () => {
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

  it("should create a currency", async () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const response = await request(app)
      .post("/currencies")
      .set("Authorization", `Bearer ${token}`)
      .send({
        code,
        name: "Knissa Test Currency",
        symbol: "K$",
        decimals: 2,
      });

    expect(response.status).toBe(201);

    expect(response.body.code).toBe(code);
    expect(response.body.name).toBe("Knissa Test Currency");
    expect(response.body.symbol).toBe("K$");
    expect(response.body.decimals).toBe(2);

    const currency = await prisma.currency.findUnique({
      where: {
        code,
      },
    });

    expect(currency).not.toBeNull();
    expect(currency?.name).toBe("Knissa Test Currency");
  });

  it("should return 409 when currency code already exists", async () => {
    const response = await request(app)
      .post("/currencies")
      .set("Authorization", `Bearer ${token}`)
      .send({
        code: "BRL",
        name: "Duplicate Real",
        symbol: "R$",
        decimals: 2,
      });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Currency already exists.");
  });

  it("should return 422 for invalid body", async () => {
    const response = await request(app)
      .post("/currencies")
      .set("Authorization", `Bearer ${token}`)
      .send({
        code: "",
        name: "",
      });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });

  it("should return 401 without authentication", async () => {
    const response = await request(app).post("/currencies").send({
      code: "USD",
      name: "US Dollar",
      symbol: "$",
      decimals: 2,
    });

    expect(response.status).toBe(401);
  });
});
