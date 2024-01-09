const supertest = require("supertest");

const app = require("../server");

let userId;

let recipeId;
let request;
let accessToken;

let connectSid;

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

let uniqueUsername;

describe("/recipe routes", () => {
  beforeAll(async () => {
    request = supertest(app);
  });
  beforeEach(async () => {
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
    connectSid = cookies
      .find((cookie) => cookie.startsWith("connect.sid="))
      .split(";")[0];
    console.warn("User ID: " + response.body.user_id);
    userId = response.body.user_id;
    expect(accessToken).toBeDefined();
    expect(connectSid).toBeDefined();
  });

  afterEach(async () => {
    //Delete the user after all tests
    const response = await request.delete(`/user/${userId}`);
    expect(response.status).toBe(200);
  });

  describe("POST /recipe", () => {
    it("should create a new recipe", async () => {
      const response = await request
        .post("/recipe")
        .send({
          title: "My Recipe",
          description: "This is a description of my recipe.",
          user_id: userId,
          image: "http://example.com/image.jpg",
          tags: ["tag1", "tag2"],
          preparation_time: "00:30:00",
          cooking_time: "01:00:00",
          servings: 4,
          difficulty_level: "Easy",
          ingredients: [
            {
              name: "Ingredient 1",
              quantity: 2,
              unit: "cups",
            },
            {
              name: "Ingredient 2",
              quantity: 1,
              unit: "tablespoon",
            },
          ],
          instructions: [
            {
              step_number: 1,
              description: "This is the first step. Without an image.",
            },
            {
              step_number: 2,
              description: "This is the second step.",
              image: "http://example.com/step2.jpg",
            },
          ],
        })
        .set("Cookie", `${accessToken}; ${connectSid}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("recipe_id");

      recipeId = response.body.recipe_id;
    });
  });

  describe("GET /recipe/sort/date/:page/:limit", () => {
    it("should get recipes, sort by date, limit and paginate", async () => {
      const response = await request
        .get("/recipe/sort/date/1/10")
        .set("Cookie", `${accessToken}; ${connectSid}`);
      expect(response.status).toBe(200);
    });
  });

  describe("GET /recipe/:id", () => {
    it("should get recipe by id", async () => {
      const response = await request
        .get(`/recipe/${recipeId}`)
        .set("Cookie", `${accessToken}; ${connectSid}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("recipe_id");
    });
  });
  describe("PUT /recipe/:id", () => {
    it("should update recipe", async () => {
      const response = await request
        .put(`/recipe/${recipeId}`)
        .send({
          title: "My Recipe",
          description: "This is an updated description of my recipe.",
          user_id: userId,
          image: "http://example.com/image.jpg",
          tags: ["tag1", "tag2"],
          preparation_time: "00:30:00",
          cooking_time: "01:00:00",
          servings: 4,
          difficulty_level: "Easy",
          ingredients: [
            {
              name: "Ingredient 1",
              quantity: 2,
              unit: "cups",
            },
            {
              name: "Ingredient 2",
              quantity: 1,
              unit: "tablespoon",
            },
          ],
          instructions: [
            {
              step_number: 1,
              description: "This is the first step. Without an image.",
            },
            {
              step_number: 2,
              description: "This is the second step.",
              image: "http://example.com/step2.jpg",
            },
          ],
        })
        .set("Cookie", `${accessToken}; ${connectSid}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("recipe_id");
      expect(response.body.description).toBe(
        "This is an updated description of my recipe."
      );
    });
  });

  describe("POST /recipe/fork/:id", () => {
    it("should fork recipe", async () => {
      const response = await request
        .post(`/recipe/fork/${recipeId}`)
        .set("Cookie", `${accessToken}; ${connectSid}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("recipe_id");
    });
  });

  describe("POST /recipe/comment/:id", () => {
    it("should create comment", async () => {
      const response = await request
        .post(`/recipe/comment/${recipeId}`)
        .send({ comment: "This is a comment." })
        .set("Cookie", `${accessToken}; ${connectSid}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("comment_id");
    });
  });

  describe("PUT /recipe/comment/:id", () => {
    it("should edit comment", async () => {
      const response = await request
        .put(`/recipe/comment/${recipeId}`)
        .send({ comment: "This is an edited comment." })
        .set("Cookie", `${accessToken}; ${connectSid}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("comment_id");
      expect(response.body.comment).toBe("This is an edited comment.");
    });
  });

  describe("DELETE /recipe/:id", () => {
    it("should delete recipe", async () => {
      const response = await request
        .delete(`/recipe/${recipeId}`)
        .set("Cookie", `${accessToken}; ${connectSid}`);
      expect(response.status).toBe(200);
    });
  });
});
