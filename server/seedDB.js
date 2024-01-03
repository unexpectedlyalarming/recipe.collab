const Pool = require("pg").Pool;
const dotenv = require("dotenv");
const fs = require("fs");
const { faker } = require("@faker-js/faker");

dotenv.config();

const dbUser = process.env.DB_USER || "postgres";
const dbPassword = process.env.DB_PASSWORD || "";
const dbName = process.env.DB_NAME || "recipecollabdb";
const dbHost = process.env.DB_HOST || "localhost";

const env = process.env.ENV_TYPE || "dev";

let poolOptions;

if (env === "dev") {
  console.log("Using dev environment");

  poolOptions = {
    user: dbUser,
    host: dbHost,
    port: 5432,
    database: dbName,
  };
}

if (env === "production") {
  console.log("Using production environment");
  poolOptions = {
    user: dbUser,
    host: dbHost,
    port: 5432,
    database: dbName,
    password: dbPassword,
  };
}
const pool = new Pool(poolOptions);

async function initializeDB() {
  try {
    const initScript = fs.readFileSync("./database.sql", "utf-8");
    const client = await pool.connect();

    // Drop all tables if they exist
    await client.query("DROP TABLE IF EXISTS recipe_versions");
    await client.query("DROP TABLE IF EXISTS instructions");
    await client.query("DROP TABLE IF EXISTS ingredients");
    await client.query("DROP TABLE IF EXISTS user_comments");
    await client.query("DROP TABLE IF EXISTS user_stars");
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

    const userCount = 70;

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
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING recipe_id
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

async function initalizeAndSeed() {
  try {
    await initializeDB();
    await seedDB();
  } catch (error) {
    console.error(error);
  }
}

initalizeAndSeed();
