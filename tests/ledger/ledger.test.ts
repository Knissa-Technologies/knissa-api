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

  const accessToken = register.body.accessToken;

  const wallets = await request(app)
    .get("/wallets")
    .set("Authorization", `Bearer ${accessToken}`);

  return {
    accessToken,
    walletId: wallets.body.data[0].id,
    accountNumber: wallets.body.data[0].accountNumber,
  };
}

describe("Ledger", () => {
  it("should list ledger entries", async () => {
    const user = await createUser(`ledger-${Date.now()}@test.com`);

    await request(app)
      .post("/wallets/deposit")
      .set("Authorization", `Bearer ${user.accessToken}`)
      .send({
        accountNumber: user.accountNumber,
        amount: 200,
      });

    const response = await request(app)
      .get("/ledger")
      .set("Authorization", `Bearer ${user.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("should return wallet ledger", async () => {
    const user = await createUser(`ledger2-${Date.now()}@test.com`);

    await request(app)
      .post("/wallets/deposit")
      .set("Authorization", `Bearer ${user.accessToken}`)
      .send({
        accountNumber: user.accountNumber,
        amount: 100,
      });

    const response = await request(app)
      .get(`/ledger/${user.walletId}`)
      .set("Authorization", `Bearer ${user.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("should return 401 without authentication", async () => {
    const response = await request(app).get("/ledger");

    expect(response.status).toBe(401);
  });

  it("should return 404 for unknown wallet", async () => {
    const user = await createUser(`ledger3-${Date.now()}@test.com`);

    const response = await request(app)
      .get("/ledger/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${user.accessToken}`);

    expect(response.status).toBe(404);
  });
});