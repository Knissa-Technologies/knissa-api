import request from "supertest";
import { describe, beforeEach, it, expect } from "vitest";

import app from "../../src/app.js";
import { prisma } from "../../src/infra/database/prisma.js";

import { cleanDatabase } from "../helpers/cleanDatabase.js";
import { createAdmin } from "../helpers/createAdmin.js";

describe("Exchange Rates", () => {
  let token: string;

  let countryId: string;

  let usdId: string;
  let brlId: string;
  let eurId: string;

  beforeEach(async () => {
    await cleanDatabase();

    const [brl, usd, eur] = await Promise.all([
      prisma.currency.findUniqueOrThrow({
        where: { code: "BRL" },
      }),
      prisma.currency.findUniqueOrThrow({
        where: { code: "USD" },
      }),
      prisma.currency.findUniqueOrThrow({
        where: { code: "EUR" },
      }),
    ]);

    brlId = brl.id;
    usdId = usd.id;
    eurId = eur.id;

    const country = await prisma.country.findUniqueOrThrow({
      where: {
        isoCode: "BR",
      },
    });

    countryId = country.id;

    const admin = await createAdmin(countryId);

    token = admin.token;
  });

  describe("GET /exchange-rates", () => {
    it("should return an empty list", async () => {
      const response = await request(app)
        .get("/exchange-rates")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it("should list exchange rates", async () => {
      await prisma.exchangeRate.create({
        data: {
          baseCurrencyId: usdId,
          quoteCurrencyId: brlId,
          rate: 5.42,
          source: "Central Bank",
        },
      });

      const response = await request(app)
        .get("/exchange-rates")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].source).toBe("Central Bank");
    });
  });

  describe("GET /exchange-rates/:id", () => {
    it("should return exchange rate by id", async () => {
      const rate = await prisma.exchangeRate.create({
        data: {
          baseCurrencyId: usdId,
          quoteCurrencyId: brlId,
          rate: 5.42,
        },
      });

      const response = await request(app)
        .get(`/exchange-rates/${rate.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data.id).toBe(rate.id);
      expect(response.body.data.baseCurrencyId).toBe(usdId);
      expect(response.body.data.quoteCurrencyId).toBe(brlId);
      expect(Number(response.body.data.rate)).toBe(5.42);
    });

    it("should return 404 when exchange rate does not exist", async () => {
      const response = await request(app)
        .get("/exchange-rates/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Exchange rate not found.");
    });
  });

  // POST vem aqui

  // PUT vem aqui

  // DELETE vem aqui
});
