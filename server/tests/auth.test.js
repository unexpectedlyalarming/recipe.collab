const request = require("supertest");
const app = require("../app");

describe("/auth routes", () => {
  describe("POST /auth/register", () => {
    it("should register a new user", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          username: global.uniqueUsername,
          password: "test",
          email: global.uniqueUsername + "@example.com",
          first_name: "Test",
          last_name: "User",
        });
      expect(response.status).toBe(200);
    });
  });

  describe("POST /auth/login", () => {
    it("should log in an existing user", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({ username: global.uniqueUsername, password: "test" });
      expect(response.status).toBe(200);
      const accessToken = response.headers["set-cookie"].find((cookie) =>
        cookie.startsWith("accessToken=")
      );
      expect(accessToken).toBeDefined();
    });
  });

  describe("POST /auth/logout", () => {
    it("should log out the current user", async () => {
      const response = await request(app).post("/auth/logout");
      expect(response.status).toBe(200);
    });
  });
});
