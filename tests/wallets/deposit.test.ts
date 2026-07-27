import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { prisma } from "../../src/infra/database/prisma.js";

describe("POST /wallets/deposit", () => {
  it("should deposit money into a wallet", async () => {
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
        email: `deposit-${Date.now()}@test.com`,
        phone: "+5511999999999",
        password: "StrongPassword123!",
        countryId: country!.id,
      });

    expect(register.status).toBe(201);

    const accessToken = register.body.accessToken;

    const wallets = await request(app)
      .get("/wallets")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(wallets.status).toBe(200);

    const accountNumber = wallets.body.data[0].accountNumber;

    const deposit = await request(app)
      .post("/wallets/deposit")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        accountNumber,
        amount: 100,
      });

    expect(deposit.status).toBe(200);

    expect(deposit.body.success).toBe(true);
    expect(Number(deposit.body.data.balance)).toBe(100);

    const updatedWallets = await request(app)
      .get("/wallets")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(updatedWallets.status).toBe(200);
    expect(Number(updatedWallets.body.data[0].balance)).toBe(100);
  });

  it("should return 401 without authentication", async () => {
    const response = await request(app).post("/wallets/deposit").send({
      accountNumber: "KN123456789",
      amount: 100,
    });

    expect(response.status).toBe(401);
  });

  it("should reject invalid amount", async () => {
    const response = await request(app).post("/wallets/deposit").send({
      accountNumber: "KN123456789",
      amount: -10,
    });

    expect(response.status).toBe(401);
  });
});
