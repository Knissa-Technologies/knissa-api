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

describe("Transactions", () => {
  it("should list transactions", async () => {
    const user = await createUser(`trx-${Date.now()}@test.com`);

    await request(app)
      .post("/wallets/deposit")
      .set("Authorization", `Bearer ${user.accessToken}`)
      .send({
        accountNumber: user.accountNumber,
        amount: 100,
      });

    const response = await request(app)
      .get("/transactions")
      .set("Authorization", `Bearer ${user.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("should return 401 without authentication", async () => {
    const response = await request(app).get("/transactions");

    expect(response.status).toBe(401);
  });

  it("should get transaction by reference", async () => {
    const user = await createUser(`trx2-${Date.now()}@test.com`);

    await request(app)
      .post("/wallets/deposit")
      .set("Authorization", `Bearer ${user.accessToken}`)
      .send({
        accountNumber: user.accountNumber,
        amount: 150,
      });

    const list = await request(app)
      .get("/transactions")
      .set("Authorization", `Bearer ${user.accessToken}`);

    const reference = list.body.data[0].reference;

    const response = await request(app)
      .get(`/transactions/${reference}`)
      .set("Authorization", `Bearer ${user.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.reference).toBe(reference);
  });

  it("should return 404 for unknown reference", async () => {
    const user = await createUser(`trx3-${Date.now()}@test.com`);

    const response = await request(app)
      .get("/transactions/TRX_DOES_NOT_EXIST")
      .set("Authorization", `Bearer ${user.accessToken}`);

    expect(response.status).toBe(404);
  });
});