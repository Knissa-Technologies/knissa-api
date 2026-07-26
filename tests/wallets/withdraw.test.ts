import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { prisma } from "../../src/infra/database/prisma.js";

describe("POST /wallets/withdraw", () => {
  it("should withdraw money from a wallet", async () => {
    const country = await prisma.country.findFirst({
      where: {
        isoCode: "BR",
      },
    });

    expect(country).not.toBeNull();

    const register = await request(app).post("/auth/register").send({
      firstName: "Jean",
      lastName: "Bauzil",
      email: `withdraw-${Date.now()}@test.com`,
      phone: "+5511999999999",
      password: "StrongPassword123!",
      countryId: country!.id,
    });

    expect(register.status).toBe(201);

    const accessToken = register.body.accessToken;

    const wallets = await request(app)
      .get("/wallets")
      .set("Authorization", `Bearer ${accessToken}`);

    const accountNumber = wallets.body.data[0].accountNumber;

    await request(app)
      .post("/wallets/deposit")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        accountNumber,
        amount: 100,
      });

    const withdraw = await request(app)
      .post("/wallets/withdraw")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        accountNumber,
        amount: 40,
      });

    expect(withdraw.status).toBe(200);
    expect(withdraw.body.success).toBe(true);
    expect(withdraw.body.reference).toBeDefined();

    const updatedWallet = await request(app)
      .get("/wallets")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(updatedWallet.status).toBe(200);
    expect(Number(updatedWallet.body.data[0].balance)).toBe(60);
  });

  it("should reject withdrawal without authentication", async () => {
    const response = await request(app).post("/wallets/withdraw").send({
      accountNumber: "KN123456789",
      amount: 10,
    });

    expect(response.status).toBe(401);
  });

  it("should reject withdrawal with insufficient balance", async () => {
    const country = await prisma.country.findFirst({
      where: {
        isoCode: "BR",
      },
    });

    expect(country).not.toBeNull();

    const register = await request(app).post("/auth/register").send({
      firstName: "Jean",
      lastName: "Bauzil",
      email: `withdraw2-${Date.now()}@test.com`,
      phone: "+5511999999999",
      password: "StrongPassword123!",
      countryId: country!.id,
    });

    const accessToken = register.body.accessToken;

    const wallets = await request(app)
      .get("/wallets")
      .set("Authorization", `Bearer ${accessToken}`);

    const accountNumber = wallets.body.data[0].accountNumber;

    const response = await request(app)
      .post("/wallets/withdraw")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        accountNumber,
        amount: 1000,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Insufficient");
  });
});