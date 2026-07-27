import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { prisma } from "../../src/infra/database/prisma.js";

import { cleanDatabase } from "../helpers/cleanDatabase.js";
import { createAdmin } from "../helpers/createAdmin.js";

describe("PUT /countries/:id", () => {
  let token: string;
  let countryId: string;

  beforeEach(async () => {
    await cleanDatabase();

    const country = await prisma.country.findUniqueOrThrow({
      where: {
        isoCode: "BR",
      },
    });

    countryId = country.id;

    const admin = await createAdmin(countryId);

    token = admin.token;
  });

  it("should update a country", async () => {
    const response = await request(app)
      .put(`/countries/${countryId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Brasil",
        phoneCode: "+55",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(response.body.data.name).toBe("Brasil");
    expect(response.body.data.phoneCode).toBe("+55");

    const country = await prisma.country.findUniqueOrThrow({
      where: {
        id: countryId,
      },
    });

    expect(country.name).toBe("Brasil");
    expect(country.phoneCode).toBe("+55");
  });

  it("should return 404 when country does not exist", async () => {
    const response = await request(app)
      .put("/countries/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test",
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("should return 422 for invalid body", async () => {
    const response = await request(app)
      .put(`/countries/${countryId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "",
      });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });

  it("should return 401 without authentication", async () => {
    const response = await request(app)
      .put(`/countries/${countryId}`)
      .send({
        name: "Brasil",
      });

    expect(response.status).toBe(401);
  });
});