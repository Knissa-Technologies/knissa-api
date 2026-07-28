import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { prisma } from "../../src/infra/database/prisma.js";

import { cleanDatabase } from "../helpers/cleanDatabase.js";
import { createAdmin } from "../helpers/createAdmin.js";

describe("DELETE /currencies/:id", () => {
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

  it("should delete a currency", async () => {
    const currency = await prisma.currency.create({
      data: {
        code: `DEL${Date.now()}`,
        name: "Delete Test Currency",
        symbol: "$",
        decimals: 2,
      },
    });

    const response = await request(app)
      .delete(`/currencies/${currency.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);

    const deletedCurrency = await prisma.currency.findUnique({
      where: {
        id: currency.id,
      },
    });

    expect(deletedCurrency).toBeNull();
  });

  it("should return 404 when currency does not exist", async () => {
    const response = await request(app)
      .delete("/currencies/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Currency not found.");
  });

  it("should return 401 without authentication", async () => {
    const currency = await prisma.currency.create({
      data: {
        code: `TMP${Date.now()}`,
        name: "Temp Currency",
        symbol: "$",
        decimals: 2,
      },
    });

    const response = await request(app).delete(
      `/currencies/${currency.id}`
    );

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication required.");
  });
});