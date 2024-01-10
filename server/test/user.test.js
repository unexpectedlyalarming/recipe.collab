const supertest = require("supertest");
const app = require("../server");

let userId;

function generateRandomUniqueUsername() {
  let characters = "abcdefghijklmnopqrstuvwxyz1234567890";

  let username = "";

  for (let i = 0; i < 16; i++) {
    username += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  username += Date.now();

  return username.slice(0, 24);
}

let request;

describe("/user routes", () => {
  let uniqueUsername;
  let accessToken;
  beforeAll(async () => {
    request = supertest.agent(app);
  });

  beforeAll(async () => {
    //Create a user
    uniqueUsername = generateRandomUniqueUsername();
    const response = await request.post("/auth/register").send({
      username: uniqueUsername,
      password: "test",
      email: uniqueUsername + "@example.com",
      first_name: "Test",
      last_name: "User",
      bio: "This is a bio.",
    });
    expect(response.status).toBe(200);
  });

  beforeEach(async () => {
    // Log in before each test
    const response = await request
      .post("/auth/login")
      .send({ username: uniqueUsername, password: "test" });
    expect(response.status).toBe(200);
    const cookies = response.headers["set-cookie"];
    accessToken = cookies
      .find((cookie) => cookie.startsWith("accessToken="))
      .split(";")[0];
    expect(accessToken).toBeDefined();

    userId = response.body.user_id;
  });

  afterAll(async () => {
    //Delete the user after each test
    const response = await request
      .delete(`/user/${userId}`)
      .set("Cookie", accessToken);
    expect(response.status).toBe(200);
  });

  describe("GET /user", () => {
    it("should return all users", async () => {
      const response = await request.get("/user").set("Cookie", accessToken);
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe("GET /user/:id", () => {
    it("should return a user", async () => {
      const response = await request
        .get(`/user/${userId}`)
        .set("Cookie", accessToken);
      expect(response.status).toBe(200);
      expect(response.body.username).toBe(uniqueUsername);
    });
  });

  describe("PUT /user/:id", () => {
    it("should update a user", async () => {
      const updatedUser = {
        username: await uniqueUsername,
        email: "new" + (await uniqueUsername).toString() + "@example.com",
        first_name: "Updated",
        last_name: "User",
        bio: "This is an updated bio.",
        profile_pic: "http://example.com/updatedjpg",
      };
      const response = await request
        .put(`/user/${userId}`)
        .send(updatedUser)
        .set("Cookie", accessToken);
      expect(response.status).toBe(200);
      expect(response.body.email).toBe(updatedUser.email);
    });
  });
});

describe("/star routes", () => {
  let accessToken;
  beforeAll(async () => {
    request = supertest.agent(app);
  });

  beforeAll(async () => {
    //Create a user
    uniqueUsername = generateRandomUniqueUsername();
    const response = await request.post("/auth/register").send({
      username: uniqueUsername,
      password: "test",
      email: uniqueUsername + "@example.com",
      first_name: "Test",
      last_name: "User",
      bio: "This is a bio.",
    });
    expect(response.status).toBe(200);
  });

  beforeEach(async () => {
    // Log in before each test
    const response = await request
      .post("/auth/login")
      .send({ username: uniqueUsername, password: "test" });
    expect(response.status).toBe(200);
    const cookies = response.headers["set-cookie"];
    accessToken = cookies
      .find((cookie) => cookie.startsWith("accessToken="))
      .split(";")[0];
    expect(accessToken).toBeDefined();

    userId = response.body.user_id;
  });

  afterAll(async () => {
    //Delete the user after each test
    const response = await request
      .delete(`/user/${userId}`)
      .set("Cookie", accessToken);
    expect(response.status).toBe(200);
  });

  describe("PUT /star/:id", () => {
    it("should star a recipe", async () => {
      const response = await request.put(`/star/1`).set("Cookie", accessToken);
      expect(response.status).toBe(200);
    });
  });

  describe("GET /star/user/:userId", () => {
    it("should return all starred recipes for a user", async () => {
      const response = await request
        .get(`/star/user/${userId}`)
        .set("Cookie", accessToken);
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
});
