import request from "supertest";

import  app  from "../../src/app.js";

export async function login(
  email: string,
  password = "12345678",
) {
  const response = await request(app)
    .post("/auth/login")
    .send({
      email,
      password,
    });

  return response.body.accessToken;
}