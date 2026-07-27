import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { prisma } from "../../src/infra/database/prisma.js";

import { cleanDatabase } from "../helpers/cleanDatabase.js";
import { createAdmin } from "../helpers/createAdmin.js";

describe("POST /countries", () => {
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

  it("should create a country", async () => {
    const response = await request(app)
      .post("/countries")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Knissa Test Country",
        isoCode: "XT",
        phoneCode: "+999",
        currencyCode: "USD",
      });

    console.log(response.body);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    expect(response.body.data.name).toBe("Knissa Test Country");
    expect(response.body.data.isoCode).toBe("XT");
    expect(response.body.data.phoneCode).toBe("+999");
    expect(response.body.data.currencyCode).toBe("USD");

    const country = await prisma.country.findUnique({
      where: {
        isoCode: "XT",
      },
    });

    expect(country).not.toBeNull();
    expect(country?.name).toBe("Knissa Test Country");
  });

  it("should return 409 when ISO code already exists", async () => {
    const response = await request(app)
      .post("/countries")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Brazil Duplicate",
        isoCode: "BR",
      });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  it("should return 422 for invalid body", async () => {
    const response = await request(app)
      .post("/countries")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "",
        isoCode: "B",
      });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });

  it("should return 401 without authentication", async () => {
    const response = await request(app).post("/countries").send({
      name: "Canada",
      isoCode: "CA",
    });

    expect(response.status).toBe(401);
  });
});
