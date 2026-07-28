import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { prisma } from "../../src/infra/database/prisma.js";

import { cleanDatabase } from "../helpers/cleanDatabase.js";
import { createAdmin } from "../helpers/createAdmin.js";

describe("PUT /currencies/:id", () => {
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

  it("should update a currency", async () => {
    const currency = await prisma.currency.findUniqueOrThrow({
      where: {
        code: "BRL",
      },
    });

    const response = await request(app)
      .put(`/currencies/${currency.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Real Brasileiro",
        symbol: "R$",
        decimals: 2,
      });

    expect(response.status).toBe(200);

    expect(response.body.id).toBe(currency.id);
    expect(response.body.name).toBe("Real Brasileiro");

    const updatedCurrency = await prisma.currency.findUnique({
      where: {
        id: currency.id,
      },
    });

    expect(updatedCurrency?.name).toBe("Real Brasileiro");
  });

  it("should return 404 when currency does not exist", async () => {
    const response = await request(app)
      .put("/currencies/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test",
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Currency not found.");
  });

  it("should return 422 for invalid body", async () => {
    const currency = await prisma.currency.findUniqueOrThrow({
      where: {
        code: "BRL",
      },
    });

    const response = await request(app)
      .put(`/currencies/${currency.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        code: "",
      });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });

  it("should return 401 without authentication", async () => {
    const currency = await prisma.currency.findUniqueOrThrow({
      where: {
        code: "BRL",
      },
    });

    const response = await request(app).put(`/currencies/${currency.id}`).send({
      name: "Test",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication required.");
  });
});
