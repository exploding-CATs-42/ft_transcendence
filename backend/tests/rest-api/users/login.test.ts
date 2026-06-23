// Libraries
import "dotenv/config";
import request from "supertest";
import { describe, expect, it } from "vitest";
// Project level
import app from "../../../src/app";

const agent = request.agent(app);

describe("POST /users/login", function () {
  it("returns 200 and a token with valid credentials", async function () {
    const res = await agent
      .post("/users/login")
      .send({ email: "bob@bestserver.com", password: "YouCanN0tHackM3!" })
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body).toHaveProperty("accessToken");
  });

  it("returns 401 with wrong password", async function () {
    const res = await agent
      .post("/users/login")
      .send({ email: "me@me.com", password: "wrongpassword" })
      .set("Accept", "application/json");

    expect(res.status).toBe(401);
  });

  it("returns 400 when email is missing", async function () {
    const res = await agent
      .post("/users/login")
      .send({ password: "somepassword" })
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
  });

  it("returns 400 when password is missing", async function () {
    const res = await agent
      .post("/users/login")
      .send({ email: "user@example.com" })
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
  });

  it("returns 401 with a non-existent email", async function () {
    const res = await agent
      .post("/users/login")
      .send({ email: "nobody@example.com", password: "somepassword" })
      .set("Accept", "application/json");

    expect(res.status).toBe(401);
  });
});
