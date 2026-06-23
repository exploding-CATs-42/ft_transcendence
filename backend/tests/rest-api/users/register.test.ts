// Libraries
import "dotenv/config";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
// Project level
import app from "../../../src/app";
import { prisma } from "lib/prisma";
import { RegisterRequestBody } from "@exploding-cats/contracts";
import { randomUUID } from "node:crypto";

const agent = request.agent(app);

describe("POST /users/register", function () {
  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it("returns 200 and a token with valid credentials", async function () {
    // Arrange
    const reqBody: RegisterRequestBody = {
      email: "bob@bestserver.com",
      password: "YouCanN0tHackM3!",
      username: "Big Bob",
    };

    // Act
    const res = await agent.post("/users/register").send(reqBody);

    // Assert
    expect(res.status).toBe(201);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body).toEqual({});
  });

  it("returns 400 when email is missing", async function () {
    const res = await agent
      .post("/users/register")
      .send({ email: "bob@bestserver.com", password: "YouCanN0tHackM3!" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "Validation error",
      errors: {
        formErrors: [],
        fieldErrors: {
          username: ["Invalid input: expected string, received undefined"],
        },
      },
    });
  });

  it("returns 400 when password is missing", async function () {
    const res = await agent
      .post("/users/register")
      .send({ email: "user@example.com" });

    expect(res.status).toBe(400);
  });

  it("returns 409 when email is already in use", async function () {
    const email = `${randomUUID()}@example.com`;

    await agent.post("/register").send({
      email,
      password: "Hacky*Pa33word",
      username: "Small Bob",
    });

    const res = await agent.post("/register").send({
      email,
      password: "YouCanN0tHackM3!",
      username: "Big Bob",
    });

    console.log(res);

    expect(res.status).toBe(409);
  });
});
