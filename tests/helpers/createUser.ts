import request from "supertest";

import app from "../../src/app";
import { prisma } from "../../src/infra/database/prisma";

export async function createUser() {
  const country = await prisma.country.findFirst({
    where: {
      code: "BR",
    },
  });

  if (!country) {
    throw new Error("Country BR not found.");
  }

  const payload = {
    firstName: "Jean",
    lastName: "Bauzil",
    email: "jean@test.com",
    password: "StrongPassword123!",
    phone: "+5511999999999",
    countryId: country.id,
  };

  const response = await request(app)
    .post("/auth/register")
    .send(payload);

  return {
    payload,
    response,
  };
}