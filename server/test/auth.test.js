const supertest = require("supertest");

const app = require("../server");

let request;
describe("/auth routes", () => {
  beforeAll(async () => {
    request = supertest(app);
  });
  describe("POST /auth/register", () => {
    it("should register a new user", async () => {
      const response = await request.post("/auth/register").send({
        username: global.uniqueUsername,
        password: "test",
        email: global.uniqueUsername + "@example.com",
        first_name: "Test",
        last_name: "User",
        bio: "This is a bio.",
      });
      expect(response.status).toBe(200);
    });
  });

  describe("POST /auth/login", () => {
    it("should log in an existing user", async () => {
      const response = await request
        .post("/auth/login")
        .send({ username: global.uniqueUsername, password: "test" });
      expect(response.status).toBe(200);
      const cookies = response.headers["set-cookie"];
      let accessToken = cookies
        .find((cookie) => cookie.startsWith("accessToken="))
        .split(";")[0];
      let connectSid = cookies
        .find((cookie) => cookie.startsWith("connect.sid="))
        .split(";")[0];
      expect(accessToken).toBeDefined();
      expect(connectSid).toBeDefined();
    });
  });

  describe("GET /auth/logout", () => {
    it("should log out the current user", async () => {
      const response = await request.get("/auth/logout");
      expect(response.status).toBe(200);
    });
  });
});
