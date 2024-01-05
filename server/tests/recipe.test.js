const request = require("supertest");
const app = require("../app");
const pool = require("../db");

const query = await pool.query("SELECT id FROM users WHERE username = $1", [
  global.uniqueUsername,
]);
const userId = query.rows[0].user_id;

let recipeId;

describe("/recipe routes", () => {
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
      });
    expect(response.status).toBe(200);
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

  afterAll(async () => {
    //Delete the user after all tests
    const response = await request(app).delete(`/user/${userId}`);
    expect(response.status).toBe(200);
  });

  describe("POST /recipe", () => {
    it("should create a new recipe", async () => {
      const response = await request(app)
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
        });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("recipe_id");

      recipeId = response.body.recipe_id;
    });
  });

  describe("GET /recipe/sort/date/:page/:limit", () => {
    it("should get recipes, sort by date, limit and paginate", async () => {
      const response = await request(app).get("/recipe/sort/date/1/10");
      expect(response.status).toBe(200);
    });
  });

  describe("GET /recipe/:id", () => {
    it("should get recipe by id", async () => {
      const response = await request(app).get(`/recipe/${recipeId}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("recipe_id");
    });
  });
  describe("PUT /recipe/:id", () => {
    it("should update recipe", async () => {
      const response = await request(app)
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
        });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("recipe_id");
      expect(response.body.description).toBe(
        "This is an updated description of my recipe."
      );
    });
  });

  describe("POST /recipe/fork/:id", () => {
    it("should fork recipe", async () => {
      const response = await request(app).post(`/recipe/fork/${recipeId}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("recipe_id");
    });
  });

  describe("POST /recipe/comment/:id", () => {
    it("should create comment", async () => {
      const response = await request(app)
        .post(`/recipe/comment/${recipeId}`)
        .send({ comment: "This is a comment." });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("comment_id");
    });
  });

  describe("PUT /recipe/comment/:id", () => {
    it("should edit comment", async () => {
      const response = await request(app)
        .put(`/recipe/comment/${recipeId}`)
        .send({ comment: "This is an edited comment." });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("comment_id");
      expect(response.body.comment).toBe("This is an edited comment.");
    });
  });

  describe("DELETE /recipe/:id", () => {
    it("should delete recipe", async () => {
      const response = await request(app).delete(`/recipe/${recipeId}`);
      expect(response.status).toBe(200);
    });
  });
});
