const Pool = require("pg").Pool;
const dotenv = require("dotenv");
const fs = require("fs");
const { faker } = require("@faker-js/faker");

dotenv.config();

const dbUser = process.env.DB_USER || "postgres";
const dbPassword = process.env.DB_PASSWORD || "";
const dbName = process.env.DB_NAME || "recipecollabdb";

const env = process.env.ENV_TYPE || "dev";

if (env === "dev") {
  console.log("Using dev database");
  const pool = new Pool({
    user: dbUser,
    host: "localhost",
    port: 5432,
    database: dbName,
  });
}

async function initializeDB() {
  try {
    const initScript = fs.readFileSync("./database.sql", "utf-8");
    const client = await pool.connect();
    await client.query(initScript);
    client.release();

    console.log("Database initialized");
  } catch (error) {
    console.error(error);
  }
}

initializeDB();

// CREATE TABLE IF NOT EXISTS users (
//     user_id SERIAL PRIMARY KEY,
//     username VARCHAR(20) NOT NULL UNIQUE,
//     password VARCHAR(20) NOT NULL,
//     email VARCHAR(50) NOT NULL UNIQUE,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     first_name VARCHAR(20) NOT NULL,
//     last_name VARCHAR(20) NOT NULL,
//     bio VARCHAR(200),
//     profile_pic VARCHAR(200),
//     is_admin BOOLEAN DEFAULT FALSE
// );

// CREATE TABLE IF NOT EXISTS user_follows (
//     follow_id SERIAL PRIMARY KEY,
//     user_id INT REFERENCES users(user_id),
//     follower_id INT REFERENCES users(user_id)
// );

// CREATE TABLE IF NOT EXISTS recipes (
//     recipe_id SERIAL PRIMARY KEY,
//     title VARCHAR(50) NOT NULL,
//     description TEXT NOT NULL,
//     user_id INT REFERENCES users(user_id),
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     image VARCHAR(200),
//     tags VARCHAR[],
//     preparation_time INTERVAL NOT NULL,
//     cooking_time INTERVAL NOT NULL,
//     servings INT NOT NULL,
//     difficulty_level VARCHAR(20) NOT NULL
// );

// CREATE TABLE IF NOT EXISTS user_stars (
//     starred_id SERIAL PRIMARY KEY,
//     user_id INT REFERENCES users(user_id),
//     recipe_id INT REFERENCES recipes(recipe_id)
// );

// CREATE TABLE IF NOT EXISTS user_comments (
//     comment_id SERIAL PRIMARY KEY,
//     user_id INT REFERENCES users(user_id),
//     recipe_id INT REFERENCES recipes(recipe_id),
//     comment TEXT NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// CREATE TABLE IF NOT EXISTS ingredients (
//     ingredient_id SERIAL PRIMARY KEY,
//     recipe_id INT REFERENCES recipes(recipe_id),
//     name VARCHAR(80) NOT NULL,
//     quantity NUMERIC NOT NULL,
//     unit VARCHAR(50) NOT NULL
// );

// CREATE TABLE IF NOT EXISTS instructions (
//     instruction_id SERIAL PRIMARY KEY,
//     recipe_id INT REFERENCES recipes(recipe_id),
//     step_number INT NOT NULL,
//     description TEXT NOT NULL,
//     image VARCHAR(200)
// );

// CREATE TABLE IF NOT EXISTS recipe_versions (
//     version_id SERIAL PRIMARY KEY,
//     original_recipe_id INT REFERENCES recipes(recipe_id),
//     version_number INT NOT NULL,
//     recipe_id INT REFERENCES recipes(recipe_id),
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

async function seedDB() {
  try {
    const client = await pool.connect();
    let user_ids = [];

    // Seed users

    const userCount = 70;

    for (let i = 0; i < userCount; i++) {
      const username = faker.internet.userName();
      const password = faker.internet.password();
      const email = faker.internet.email();
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const bio = faker.lorem.sentence();
      const profilePic = faker.image.avatar();
      const isAdmin = faker.datatype.boolean();

      const query = `
                INSERT INTO users (username, password, email, first_name, last_name, bio, profile_pic, is_admin)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;
      const values = [
        username,
        password,
        email,
        firstName,
        lastName,
        bio,
        profilePic,
        isAdmin,
      ];

      const result = await client.query(query, values);

      user_ids.push(result.rows[0].user_id);
    }

    let recipe_ids = [];

    // Seed recipes

    const recipeCount = 30;

    for (let i = 0; i < recipeCount; i++) {
      const title = faker.lorem.words(3);
      const description = faker.lorem.paragraph();
      //Get user id from existing users
      const userId = faker.helpers.arrayElement(user_ids);
      const createdAt = faker.date.past();
      const updatedAt = faker.date.recent();
      const image = faker.image.urlLoremFlickr({ category: "food" });
      const tags = [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()];
      const preparationTime = faker.number.bigInt({ min: 10, max: 60 });
      const cookingTime = faker.number.bigInt({ min: 20, max: 120 });
      const servings = faker.number.bigInt({ min: 1, max: 10 });
      const difficultyLevel = faker.helpers.arrayElement([
        "Easy",
        "Medium",
        "Hard",
      ]);

      const query = `
                INSERT INTO recipes (title, description, user_id, created_at, updated_at, image, tags, preparation_time, cooking_time, servings, difficulty_level)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `;
      const values = [
        title,
        description,
        userId,
        createdAt,
        updatedAt,
        image,
        tags,
        preparationTime,
        cookingTime,
        servings,
        difficultyLevel,
      ];

      const result = await client.query(query, values);

      // Seed ingredients for recipe

      const ingredientAmount = faker.number.bigInt({ min: 3, max: 12 });

      for (let i = 0; i < ingredientAmount; i++) {
        const recipeId = result.rows[0].recipe_id;
        const name = faker.lorem.word();
        const quantity = faker.number.bigInt({ min: 1, max: 10 });
        const unit = faker.helpers.arrayElement([
          "g",
          "kg",
          "ml",
          "l",
          "tsp",
          "tbsp",
          "cup",
          "pinch",
          "oz",
          "lb",
        ]);

        const query = `
                        INSERT INTO ingredients (recipe_id, name, quantity, unit)
                        VALUES ($1, $2, $3, $4)
                    `;
        const values = [recipeId, name, quantity, unit];

        await client.query(query, values);
      }

      const instructionAmount = faker.number.bigInt({ min: 3, max: 12 });

      // Seed instructions for recipe

      for (let i = 0; i < instructionAmount; i++) {
        const recipeId = result.rows[0].recipe_id;
        const stepNumber = i + 1;
        const description = faker.lorem.paragraph();
        const image = faker.image.urlLoremFlickr({ category: "food" });

        // 2/3 chance of no image for a step
        if (faker.datatype.boolean(0.66)) {
          image = "";
        }

        const query = `
                        INSERT INTO instructions (recipe_id, step_number, description, image)
                        VALUES ($1, $2, $3, $4)
                    `;
        const values = [recipeId, stepNumber, description, image];

        await client.query(query, values);
      }
    }

    // Seed user_follows

    const userFollowCount = userCount * 0.5;

    for (let i = 0; i < userFollowCount; i++) {
      const userId = faker.helpers.arrayElement(user_ids);
      const followerId = faker.helpers.arrayElement(user_ids);

      const query = `
                    INSERT INTO user_follows (user_id, follower_id)
                    VALUES ($1, $2)
                `;
      const values = [userId, followerId];

      await client.query(query, values);
    }

    // Seed user_stars

    const userStarCount = recipeCount * 0.6;

    for (let i = 0; i < userStarCount; i++) {
      const userId = faker.helpers.arrayElement(user_ids);
      const recipeId = faker.helpers.arrayElement(recipe_ids);

      const query = `
                        INSERT INTO user_stars (user_id, recipe_id)
                        VALUES ($1, $2)
                    `;
      const values = [userId, recipeId];

      await client.query(query, values);
    }

    // Seed user_comments

    const userCommentCount = recipeCount * 0.6;

    for (let i = 0; i < userCommentCount; i++) {
      const userId = faker.helpers.arrayElement(user_ids);
      const recipeId = faker.helpers.arrayElement(recipe_ids);
      const comment = faker.lorem.paragraph();
      const createdAt = faker.date.past();
      let updatedAt = false;

      if (faker.datatype.boolean(0.18)) {
        updatedAt = faker.date.recent();
      }

      updatedAt
        ? (query = `
        INSERT INTO user_comments (user_id, recipe_id, comment, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        `)
        : (query = `
        INSERT INTO user_comments (user_id, recipe_id, comment, created_at)
        VALUES ($1, $2, $3, $4)
        `);

      const values = updatedAt
        ? [userId, recipeId, comment, createdAt, updatedAt]
        : [userId, recipeId, comment, createdAt];

      await client.query(query, values);
    }

    //Seed recipe_versions

    const recipeVersionCount = recipeCount * 0.1;

    for (let i = 0; i < recipeVersionCount; i++) {
      const originalRecipeId = faker.helpers.arrayElement(recipe_ids);
      const versionNumber = faker.number.bigInt({ min: 2, max: 10 });
      const recipeId = faker.helpers.arrayElement(recipe_ids);
      const createdAt = faker.date.past();
      const updatedAt = faker.date.recent();

      const query = `
                            INSERT INTO recipe_versions (original_recipe_id, version_number, recipe_id, created_at, updated_at)
                            VALUES ($1, $2, $3, $4, $5)
                        `;
      const values = [
        originalRecipeId,
        versionNumber,
        recipeId,
        createdAt,
        updatedAt,
      ];

      await client.query(query, values);
    }

    console.log("Database seeded successfully! 🌱 \nHappy coding! 🎉");

    client.release();
  } catch (error) {
    console.error(error);
  }
}
