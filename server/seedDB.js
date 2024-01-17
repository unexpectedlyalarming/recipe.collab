const Pool = require("pg").Pool;
const dotenv = require("dotenv");
const fs = require("fs");
const { faker } = require("@faker-js/faker");
const readlineSync = require("readline-sync");

dotenv.config();

const dbUser = process.env.DB_USER || "postgres";
const dbPassword = process.env.DB_PASSWORD || "";
const dbName = process.env.DB_NAME || "recipecollabdb";
const dbHost = process.env.DB_HOST || "localhost";

console.log("Using dev environment");

let poolOptions = {
  user: dbUser,
  host: dbHost,
  port: 5432,
  database: dbName,
};

const pool = new Pool(poolOptions);

async function initializeDB() {
  try {
    const initScript = fs.readFileSync("./database.sql", "utf-8");
    const client = await pool.connect();

    // Drop all tables if they exist
    await client.query("DROP TABLE IF EXISTS recipe_ratings");
    await client.query("DROP TABLE IF EXISTS recipe_views");
    await client.query("DROP TABLE IF EXISTS user_carts");
    await client.query("DROP TABLE IF EXISTS recipe_versions");
    await client.query("DROP TABLE IF EXISTS instructions");
    await client.query("DROP TABLE IF EXISTS ingredients");
    await client.query("DROP TABLE IF EXISTS user_comments");
    await client.query("DROP TABLE IF EXISTS user_stars");
    await client.query("DROP TABLE IF EXISTS list_recipes");
    await client.query("DROP TABLE IF EXISTS lists");
    await client.query("DROP TABLE IF EXISTS recipe_tags");
    await client.query("DROP TABLE IF EXISTS recipes");
    await client.query("DROP TABLE IF EXISTS user_follows");
    await client.query("DROP TABLE IF EXISTS users");

    await client.query(initScript);

    client.release();

    console.log("Database initialized");
  } catch (error) {
    console.error(error);
  }
}

async function seedDB() {
  try {
    const client = await pool.connect();
    let user_ids = [];

    // Seed users

    /* 
    I set this number arbitrarily. Everything will auto
    adjust if you change this to whatever you want.

    */
    const userCount = 450;

    for (let i = 0; i < userCount; i++) {
      const password = faker.internet
        .password({ min: 3, max: 20 })
        .substring(0, 20);
      const email = faker.internet.email({ min: 3, max: 15 });
      const firstName = faker.person
        .firstName({ min: 3, max: 20 })
        .substring(0, 20);
      const lastName = faker.person
        .lastName({ min: 3, max: 20 })
        .substring(0, 20);
      const username = faker.internet
        .userName({
          firstName: firstName,
          lastName: lastName,
        })
        .substring(0, 20);
      const bio = faker.lorem.sentence();
      const profilePic = faker.image.avatar();
      const isAdmin = faker.datatype.boolean();

      const query = `
                INSERT INTO users (username, password, email, first_name, last_name, bio, profile_pic, is_admin)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING user_id
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

    const recipeCount = userCount * 0.4;

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
                INSERT INTO recipes (title, description, user_id, created_at, updated_at, image, preparation_time, cooking_time, servings, difficulty_level, tags)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING recipe_id
            `;
      const values = [
        title,
        description,
        userId,
        createdAt,
        updatedAt,
        image,

        preparationTime,
        cookingTime,
        servings,
        difficultyLevel,
        tags,
      ];

      const result = await client.query(query, values);

      recipe_ids.push(result.rows[0].recipe_id);

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
        let image = faker.image.urlLoremFlickr({ category: "food" });

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

      // Seed tags for recipe

      for (let tag of tags) {
        const recipeId = result.rows[0].recipe_id;

        const query = `
                        INSERT INTO recipe_tags (recipe_id, tag)
                        VALUES ($1, $2)
                    `;
        const values = [recipeId, tag];

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

    const userStarCount = userCount * 1.2;

    let previousStars = [];

    for (let i = 0; i < userStarCount; i++) {
      const userId = faker.helpers.arrayElement(user_ids);
      const recipeId = faker.helpers.arrayElement(recipe_ids);

      // Prevent duplicate stars

      if (previousStars.includes(`${userId}-${recipeId}`)) {
        continue;
      }

      previousStars.push(`${userId}-${recipeId}`);

      const query = `
                        INSERT INTO user_stars (user_id, recipe_id)
                        VALUES ($1, $2)
                    `;
      const values = [userId, recipeId];

      await client.query(query, values);
    }

    // Seed user_comments

    let comment_ids = [];

    const userCommentCount = userCount * 0.5;

    for (let i = 0; i < userCommentCount; i++) {
      const userId = faker.helpers.arrayElement(user_ids);
      const recipeId = faker.helpers.arrayElement(recipe_ids);
      const comment = faker.lorem.paragraph();
      const createdAt = faker.date.past();
      let updatedAt = null;

      if (faker.datatype.boolean(0.18)) {
        updatedAt = faker.date.recent();
      }

      let query = `
        INSERT INTO user_comments (user_id, recipe_id, comment, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING comment_id
      `;

      const values = [userId, recipeId, comment, createdAt, updatedAt];
      const result = await client.query(query, values);
      comment_ids.push(result.rows[0].comment_id);
    }

    for (let i = 0; i < comment_ids.length; i++) {
      if (faker.datatype.boolean(0.2)) {
        const replyTo = faker.helpers.arrayElement(comment_ids);
        let query = `
          UPDATE user_comments
          SET reply_to = $1
          WHERE comment_id = $2
        `;
        const values = [replyTo, comment_ids[i]];
        await client.query(query, values);
      }
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

    // Seed user_carts

    const userCartCount = userCount * 0.5;

    let previousCombinations = [];
    let cartCount = 0;

    while (cartCount < userCartCount) {
      const userId = faker.helpers.arrayElement(user_ids);
      const recipeId = faker.helpers.arrayElement(recipe_ids);

      if (previousCombinations.includes(`${userId}-${recipeId}`)) {
        continue;
      }

      const query = `
                            INSERT INTO user_carts (user_id, recipe_id)
                            VALUES ($1, $2)
                        `;
      const values = [userId, recipeId];

      await client.query(query, values);

      previousCombinations.push(`${userId}-${recipeId}`);
      cartCount++;
    }

    // Seed recipe_views

    const recipeViewCount = userCount * 2;

    let previousViews = [];
    let viewCount = 0;

    while (viewCount < recipeViewCount) {
      const userId = faker.helpers.arrayElement(user_ids);
      const recipeId = faker.helpers.arrayElement(recipe_ids);

      if (previousViews.includes(`${userId}-${recipeId}`)) {
        continue;
      }
      const createdAt = faker.date.past();

      const query = `
                            INSERT INTO recipe_views (user_id, recipe_id, created_at)
                            VALUES ($1, $2, $3)
                        `;
      const values = [userId, recipeId, createdAt];

      await client.query(query, values);

      previousViews.push(`${userId}-${recipeId}`);
      viewCount++;
    }

    // Seed recipe_ratings

    const recipeRatingCount = userCount * 0.4;

    let previousRatings = [];

    for (let i = 0; i < recipeRatingCount; i++) {
      const userId = faker.helpers.arrayElement(user_ids);
      const recipeId = faker.helpers.arrayElement(recipe_ids);
      const rating = faker.number.bigInt({ min: 1, max: 5 });
      const createdAt = faker.date.past();

      // Prevent duplicate ratings

      if (previousRatings.includes(`${userId}-${recipeId}`)) {
        continue;
      }

      previousRatings.push(`${userId}-${recipeId}`);

      const query = `
      INSERT INTO recipe_ratings (user_id, recipe_id, rating, created_at)
       VALUES ($1, $2, $3, $4)
       `;
      const values = [userId, recipeId, rating, createdAt];

      await client.query(query, values);
    }

    // Seed lists

    const listCount = userCount * 0.5;

    let list_ids = [];

    for (let i = 0; i < listCount; i++) {
      const userId = faker.helpers.arrayElement(user_ids);
      const name = faker.lorem.words(3);
      const description = faker.lorem.paragraph();
      const createdAt = faker.date.past();
      const updatedAt = faker.date.recent();

      const query = `
      INSERT INTO lists (user_id, name, description, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5) RETURNING list_id
        `;
      const values = [userId, name, description, createdAt, updatedAt];

      const result = await client.query(query, values);

      list_ids.push(result.rows[0].list_id);
    }
    // Seed list_recipes

    const listRecipeCount = faker.number.bigInt({ min: 1, max: 10 });

    let previousListRecipes = [];

    let listRecipeCounter = 0;

    while (listRecipeCounter < listRecipeCount) {
      const listId = faker.helpers.arrayElement(list_ids);
      const recipeId = faker.helpers.arrayElement(recipe_ids);

      if (previousListRecipes.includes(`${listId}-${recipeId}`)) {
        continue;
      }

      const query = `
        INSERT INTO list_recipes (list_id, recipe_id)
          VALUES ($1, $2)
          `;
      const values = [listId, recipeId];

      await client.query(query, values);

      previousListRecipes.push(`${listId}-${recipeId}`);
      listRecipeCounter++;
    }

    client.release();
  } catch (error) {
    console.error(error);
  } finally {
    console.log("Database seeded successfully! 🌱 \nHappy coding! 🎉");
  }
}

async function initalizeAndSeed() {
  try {
    await initializeDB();
    await seedDB();
  } catch (error) {
    console.error(error);
  }
}

const confirm = readlineSync.question(
  "WARNING: This will delete all data in the database and is UNRECOVERABLE. If you are looking to initialize the database, run 'npm run setup' instead, and set your environment to production.\nAre you sure you want to seed the database? (y/n): "
);
if (confirm.toLowerCase() === "yes" || confirm.toLowerCase() === "y") {
  initalizeAndSeed();
} else {
  console.log("Exiting...");
}

// CREATE TABLE IF NOT EXISTS users (
//   user_id SERIAL PRIMARY KEY,
//   username VARCHAR(24) NOT NULL UNIQUE,
//   password VARCHAR(80) NOT NULL,
//   email VARCHAR(60) NOT NULL UNIQUE,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   first_name VARCHAR(24) NOT NULL,
//   last_name VARCHAR(24) NOT NULL,
//   bio VARCHAR(200),
//   profile_pic VARCHAR(200),
//   is_admin BOOLEAN DEFAULT FALSE,
//   is_active BOOLEAN DEFAULT FALSE

// );

// CREATE TABLE IF NOT EXISTS user_follows (
//   follow_id SERIAL PRIMARY KEY,
//   user_id INT REFERENCES users(user_id),
//   follower_id INT REFERENCES users(user_id)
// );

// CREATE TABLE IF NOT EXISTS recipes (
//   recipe_id SERIAL PRIMARY KEY,
//   title VARCHAR(50) NOT NULL,
//   description TEXT NOT NULL,
//   user_id INT REFERENCES users(user_id),
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   image VARCHAR(200),
//   preparation_time INTERVAL NOT NULL,
//   cooking_time INTERVAL NOT NULL,
//   servings INT NOT NULL,
//   difficulty_level VARCHAR(24) NOT NULL
// );

// CREATE TABLE IF NOT EXISTS recipe_tags (
//   tag_id SERIAL PRIMARY KEY,
//   recipe_id INT REFERENCES recipes(recipe_id),
//   tag VARCHAR(50) NOT NULL
// );

// CREATE TABLE IF NOT EXISTS lists (
//   list_id SERIAL PRIMARY KEY,
//   user_id INT REFERENCES users(user_id),
//   name VARCHAR(50) NOT NULL,
//   description TEXT,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// CREATE TABLE IF NOT EXISTS list_recipes (
//   list_recipe_id SERIAL PRIMARY KEY,
//   list_id INT REFERENCES lists(list_id),
//   recipe_id INT REFERENCES recipes(recipe_id)
//   UNIQUE(list_id, recipe_id)

// );

// CREATE TABLE IF NOT EXISTS user_stars (
//   starred_id SERIAL PRIMARY KEY,
//   user_id INT REFERENCES users(user_id),
//   recipe_id INT REFERENCES recipes(recipe_id)
// );

// CREATE TABLE IF NOT EXISTS user_comments (
//   comment_id SERIAL PRIMARY KEY,
//   user_id INT REFERENCES users(user_id),
//   recipe_id INT REFERENCES recipes(recipe_id),
//   reply_to INT REFERENCES user_comments(comment_id),
//   comment TEXT NOT NULL,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// CREATE TABLE IF NOT EXISTS ingredients (
//   ingredient_id SERIAL PRIMARY KEY,
//   recipe_id INT REFERENCES recipes(recipe_id),
//   name VARCHAR(80) NOT NULL,
//   quantity NUMERIC NOT NULL,
//   unit VARCHAR(50) NOT NULL
// );

// CREATE TABLE IF NOT EXISTS instructions (
//   instruction_id SERIAL PRIMARY KEY,
//   recipe_id INT REFERENCES recipes(recipe_id),
//   step_number INT NOT NULL,
//   description TEXT NOT NULL,
//   image VARCHAR(200)
// );

// CREATE TABLE IF NOT EXISTS recipe_versions (
//   version_id SERIAL PRIMARY KEY,
//   original_recipe_id INT REFERENCES recipes(recipe_id),
//   version_number INT NOT NULL,
//   recipe_id INT REFERENCES recipes(recipe_id),
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// CREATE TABLE IF NOT EXISTS user_carts (
//   cart_id SERIAL PRIMARY KEY,
//   user_id INT REFERENCES users(user_id),
//   recipe_id INT REFERENCES recipes(recipe_id)m
//   UNIQUE(user_id, recipe_id)
// );

// CREATE TABLE IF NOT EXISTS recipe_views (
//   view_id SERIAL PRIMARY KEY,
//   user_id INT REFERENCES users(user_id),
//   recipe_id INT REFERENCES recipes(recipe_id),
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//   UNIQUE(user_id, recipe_id)
// );

// CREATE TABLE IF NOT EXISTS recipe_ratings (
//   rating_id SERIAL PRIMARY KEY,
//   user_id INT REFERENCES users(user_id),
//   recipe_id INT REFERENCES recipes(recipe_id),
//   rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//   UNIQUE(user_id, recipe_id)
// );
