import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { prisma } from "../../src/infra/database/prisma.js";

import { cleanDatabase } from "../helpers/cleanDatabase.js";
import { createAdmin } from "../helpers/createAdmin.js";

describe("DELETE /countries/:id", () => {
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

  it("should delete a country", async () => {
    const created = await prisma.country.create({
      data: {
        name: "Test Country",
        isoCode: "TC",
        phoneCode: "+999",
      },
    });

    const response = await request(app)
      .delete(`/countries/${created.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);

    const country = await prisma.country.findUnique({
      where: {
        id: created.id,
      },
    });

    expect(country).toBeNull();
  });

  it("should return 404 when country does not exist", async () => {
    const response = await request(app)
      .delete("/countries/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("should return 401 without authentication", async () => {
    const response = await request(app)
      .delete(`/countries/${countryId}`);

    expect(response.status).toBe(401);
  });
});