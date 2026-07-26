import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { prisma } from "../../src/infra/database/prisma.js";

async function createUser(email: string) {
  const country = await prisma.country.findFirst({
    where: {
      isoCode: "BR",
    },
  });

  expect(country).not.toBeNull();

  const register = await request(app).post("/auth/register").send({
    firstName: "Jean",
    lastName: "Bauzil",
    email,
    phone: "+5511999999999",
    password: "StrongPassword123!",
    countryId: country!.id,
  });

  expect(register.status).toBe(201);

  const accessToken = register.body.accessToken;

  const wallets = await request(app)
    .get("/wallets")
    .set("Authorization", `Bearer ${accessToken}`);

  return {
    accessToken,
    accountNumber: wallets.body.data[0].accountNumber,
  };
}

describe("GET /wallets/statement/:accountNumber", () => {
  it("should return wallet statement", async () => {
    const user = await createUser(`statement-${Date.now()}@test.com`);

    await request(app)
      .post("/wallets/deposit")
      .set("Authorization", `Bearer ${user.accessToken}`)
      .send({
        accountNumber: user.accountNumber,
        amount: 100,
      });

    await request(app)
      .post("/wallets/withdraw")
      .set("Authorization", `Bearer ${user.accessToken}`)
      .send({
        accountNumber: user.accountNumber,
        amount: 40,
      });

    const statement = await request(app)
      .get(`/wallets/statement/${user.accountNumber}`)
      .set("Authorization", `Bearer ${user.accessToken}`);

    expect(statement.status).toBe(200);

    expect(statement.body.success).toBe(true);

    expect(statement.body.data.wallet.accountNumber).toBe(
      user.accountNumber,
    );

    expect(statement.body.data.wallet.currency).toBe("BRL");

    expect(statement.body.data.wallet.status).toBe("ACTIVE");

    expect(statement.body.data.wallet.balance).toBe(60);

    expect(Array.isArray(statement.body.data.transactions)).toBe(true);

    expect(statement.body.data.transactions.length).toBeGreaterThanOrEqual(2);
  });

  it("should return 401 without authentication", async () => {
    const response = await request(app).get(
      "/wallets/statement/KN123456789",
    );

    expect(response.status).toBe(401);
  });

  it("should return 404 when wallet does not exist", async () => {
    const country = await prisma.country.findFirst({
      where: {
        isoCode: "BR",
      },
    });

    const register = await request(app).post("/auth/register").send({
      firstName: "Jean",
      lastName: "Bauzil",
      email: `statement404-${Date.now()}@test.com`,
      phone: "+5511999999999",
      password: "StrongPassword123!",
      countryId: country!.id,
    });

    const accessToken = register.body.accessToken;

    const response = await request(app)
      .get("/wallets/statement/KN999999999999")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toContain("Wallet");
  });
});