import request from "supertest";
import app from "../../src/app.js";

export async function createUser(email: string, countryId: string) {
  const password = "12345678";

  const response = await request(app).post("/auth/register").send({
    firstName: "Jean",
    lastName: "Bauzil",
    email,
    password,
    phone: "+5511999999999",
    countryId,
  });

  return response.body;
}
