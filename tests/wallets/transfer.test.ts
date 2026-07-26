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

  expect(wallets.status).toBe(200);

  return {
    accessToken,
    accountNumber: wallets.body.data[0].accountNumber,
  };
}

describe("POST /wallets/transfer", () => {
  it("should transfer money between wallets", async () => {
    const userA = await createUser(`a-${Date.now()}@test.com`);
    const userB = await createUser(`b-${Date.now()}@test.com`);

    await request(app)
      .post("/wallets/deposit")
      .set("Authorization", `Bearer ${userA.accessToken}`)
      .send({
        accountNumber: userA.accountNumber,
        amount: 100,
      });

    const transfer = await request(app)
      .post("/wallets/transfer")
      .set("Authorization", `Bearer ${userA.accessToken}`)
      .send({
        fromAccount: userA.accountNumber,
        toAccount: userB.accountNumber,
        amount: 40,
      });

    expect(transfer.status).toBe(200);
    expect(transfer.body.success).toBe(true);
    expect(transfer.body.reference).toBeDefined();

    const walletA = await request(app)
      .get("/wallets")
      .set("Authorization", `Bearer ${userA.accessToken}`);

    const walletB = await request(app)
      .get("/wallets")
      .set("Authorization", `Bearer ${userB.accessToken}`);

    expect(Number(walletA.body.data[0].balance)).toBe(60);
    expect(Number(walletB.body.data[0].balance)).toBe(40);
  });

  it("should reject transfer without authentication", async () => {
    const response = await request(app).post("/wallets/transfer").send({
      fromAccount: "KN111",
      toAccount: "KN222",
      amount: 10,
    });

    expect(response.status).toBe(401);
  });

  it("should reject transfer with insufficient balance", async () => {
    const userA = await createUser(`c-${Date.now()}@test.com`);
    const userB = await createUser(`d-${Date.now()}@test.com`);

    const response = await request(app)
      .post("/wallets/transfer")
      .set("Authorization", `Bearer ${userA.accessToken}`)
      .send({
        fromAccount: userA.accountNumber,
        toAccount: userB.accountNumber,
        amount: 500,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Insufficient");
  });

  it("should reject transfer to the same wallet", async () => {
    const user = await createUser(`same-${Date.now()}@test.com`);

    await request(app)
      .post("/wallets/deposit")
      .set("Authorization", `Bearer ${user.accessToken}`)
      .send({
        accountNumber: user.accountNumber,
        amount: 100,
      });

    const response = await request(app)
      .post("/wallets/transfer")
      .set("Authorization", `Bearer ${user.accessToken}`)
      .send({
        fromAccount: user.accountNumber,
        toAccount: user.accountNumber,
        amount: 20,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("different");
  });

  it("should return 404 when destination wallet does not exist", async () => {
    const user = await createUser(`dest-${Date.now()}@test.com`);

    await request(app)
      .post("/wallets/deposit")
      .set("Authorization", `Bearer ${user.accessToken}`)
      .send({
        accountNumber: user.accountNumber,
        amount: 100,
      });

    const response = await request(app)
      .post("/wallets/transfer")
      .set("Authorization", `Bearer ${user.accessToken}`)
      .send({
        fromAccount: user.accountNumber,
        toAccount: "KN999999999999",
        amount: 10,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toContain("Destination");
  });
});