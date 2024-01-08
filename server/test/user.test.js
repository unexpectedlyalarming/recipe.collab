const request = require("supertest");
const app = require("../server");
const pool = require("../db");

let userId;

const updatedUser = {
  username: global.uniqueUsername,
  email: "new" + global.uniqueUsername + "@example.com",
  first_name: "Updated",
  last_name: "User",
  bio: "This is an updated bio.",
  profile_pic: "http://example.com/updated.jpg",
};

describe("/user routes", () => {
  beforeEach(async () => {
    //Create a user

    const response = await request(app)
      .post("/auth/register")
      .send({
        username: global.uniqueUsername,
        password: "test",
        email: global.uniqueUsername + "@example.com",
        first_name: "Test",
        last_name: "User",
        bio: "This is a bio.",
      });
    expect(response.status).toBe(200);
    userId = response.body.user_id;
  });

  beforeEach(async () => {
    // Log in before each test
    const response = await request(app)
      .post("/auth/login")
      .send({ username: global.uniqueUsername, password: "test" });
    expect(response.status).toBe(200);
    const accessToken = response.headers["set-cookie"].find((cookie) =>
      cookie.startsWith("accessToken=")
    );
    expect(accessToken).toBeDefined();
  });

  afterEach(async () => {
    //Delete the user after each test
    const response = await request(app).delete(`/user/${userId}`);
    expect(response.status).toBe(200);
  });

  describe("GET /user", () => {
    it("should return all users", async () => {
      const response = await request(app).get("/user");
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe("GET /user/:id", () => {
    it("should return a user", async () => {
      const response = await request(app).get(`/user/${userId}`);
      expect(response.status).toBe(200);
      expect(response.body.username).toBe(global.uniqueUsername);
    });
  });

  describe("PUT /user/:id", () => {
    it("should update a user", async () => {
      const response = await request(app)
        .put(`/user/${userId}`)
        .send(updatedUser);
      expect(response.status).toBe(200);
      expect(response.body.email).toBe(updatedUser.email);
    });
  });
});

describe("/star routes", () => {
  beforeEach(async () => {
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

  beforeEach(async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ username: global.uniqueUsername, password: "test" });
    expect(response.status).toBe(200);
    const accessToken = response.headers["set-cookie"].find((cookie) =>
      cookie.startsWith("accessToken=")
    );
    expect(accessToken).toBeDefined();
  });

  afterEach(async () => {
    //Delete the user after each test
    const response = await request(app).delete(`/user/${userId}`);
    expect(response.status).toBe(200);
  });

  describe("POST /star/:id", () => {
    it("should star a recipe", async () => {
      const response = await request(app).post(`/star/1`);
      expect(response.status).toBe(200);
    });
  });

  describe("GET /star/user/:userId", () => {
    it("should return all starred recipes for a user", async () => {
      const response = await request(app).get(`/star/user/${userId}`);
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
});

// // Star/unstar recipe
// router.post("/:id", async (req, res) => {

//   // Get starred recipes

//   router.get("/user/:userId", async (req, res) => {
