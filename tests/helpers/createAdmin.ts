import request from "supertest";
import { expect } from "vitest";

import { UserRole } from "@prisma/client";

import app from "../../src/app.js";
import { prisma } from "../../src/infra/database/prisma.js";

export async function createAdmin(countryId: string) {
  const email = `admin-${Date.now()}@test.com`;

  // Registrar usuário
  const password = "12345678";

  const register = await request(app).post("/auth/register").send({
    firstName: "Admin",
    lastName: "User",
    email,
    password,
    phone: "+5511999999999",
    countryId,
  });

  // Se falhar, mostrar exatamente o motivo
  if (register.status !== 201) {
    console.error("❌ Register failed:");
    console.error(register.body);

    throw new Error(
      `Register failed (${register.status}): ${JSON.stringify(register.body)}`,
    );
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email,
    },
  });

  // Promove para ADMIN
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      role: UserRole.ADMIN,
    },
  });

  // Login
  const login = await request(app).post("/auth/login").send({
    email,
    password,
  });

  expect(login.status).toBe(200);
  expect(login.body).toHaveProperty("accessToken");

  return {
    token: login.body.accessToken,
    user,
  };
}
