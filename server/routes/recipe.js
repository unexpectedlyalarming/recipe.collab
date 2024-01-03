const express = require("express");

const router = express.Router();

const pool = require("../db");

// Recipes routes

// CREATE TABLE IF NOT EXISTS recipes (
//     recipe_id SERIAL PRIMARY KEY,
//     title VARCHAR(50) NOT NULL,
//     description TEXT,
//     user_id INT REFERENCES users(user_id),
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     image VARCHAR(200),
//     tags VARCHAR[],
//     preparation_time INTERVAL,
//     cooking_time INTERVAL,
//     servings INT,
//     difficulty_level VARCHAR(20)
// );

//Client side object protoype:

// {
//     "title": "My Recipe",
//     "description": "This is a description of my recipe.",
//     "user_id": 1,
//     "image": "http://example.com/image.jpg",
//     "tags": ["tag1", "tag2"],
//     "preparation_time": "00:30:00",
//     "cooking_time": "01:00:00",
//     "servings": 4,
//     "difficulty_level": "Easy",
//     "ingredients": [
//         {
//             "name": "Ingredient 1",
//             "quantity": 2,
//             "unit": "cups"
//         },
//         {
//             "name": "Ingredient 2",
//             "quantity": 1,
//             "unit": "tablespoon"
//         }
//     ],
//     "instructions": [
//         {
//             "step_number": 1,
//             "description": "This is the first step.",
//             "image": "http://example.com/step1.jpg"
//         },
//         {
//             "step_number": 2,
//             "description": "This is the second step.",
//             "image": "http://example.com/step2.jpg"
//         }
//     ]
// }

// Create recipe

router.post("/", checkValidForm, async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      tags,
      preparation_time,
      cooking_time,
      servings,
      difficulty_level,
      ingredients,
      instructions,
    } = req.body;

    const user_id = req.user;

    const newRecipe = await pool.query(
      "INSERT INTO recipes (title, description, user_id, image, tags, preparation_time, cooking_time, servings, difficulty_level) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [
        title,
        description,
        user_id,
        image,
        tags,
        preparation_time,
        cooking_time,
        servings,
        difficulty_level,
      ]
    );

    const recipe_id = newRecipe.rows[0].recipe_id;

    ingredients.forEach(async (ingredient) => {
      const { name, quantity, unit } = ingredient;
      const newIngredient = await pool.query(
        "INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES ($1, $2, $3, $4) RETURNING *",
        [recipe_id, name, quantity, unit]
      );
    });

    instructions.forEach(async (instruction) => {
      const { step_number, description, image } = instruction;
      const newInstruction = await pool.query(
        "INSERT INTO instructions (recipe_id, step_number, description, image) VALUES ($1, $2, $3, $4) RETURNING *",
        [recipe_id, step_number, description, image]
      );
    });

    const newRecipeObject = {
      recipe_id: newRecipe.rows[0].recipe_id,
      title: newRecipe.rows[0].title,
      description: newRecipe.rows[0].description,
      user_id: newRecipe.rows[0].user_id,
      image: newRecipe.rows[0].image,
      tags: newRecipe.rows[0].tags,
      preparation_time: newRecipe.rows[0].preparation_time,
      cooking_time: newRecipe.rows[0].cooking_time,
      servings: newRecipe.rows[0].servings,
      difficulty_level: newRecipe.rows[0].difficulty_level,
      ingredients: ingredients,
      instructions: instructions,
    };

    res.status(200).json(newRecipeObject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recipes, sort by date, limit and paginate

router.get("/sort/date/:page/:limit", async (req, res) => {
  try {
    const { page, limit } = req.params;
    !page ? (page = 1) : page;
    !limit ? (limit = 20) : limit;
    const offset = (page - 1) * limit;
    const recipes = await pool.query(
      "SELECT * FROM recipes ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    res.status(200).json(recipes.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recipes, sort by user_stars, limit and paginate

//CREATE TABLE IF NOT EXISTS user_stars (
//     starred_id SERIAL PRIMARY KEY,
//     user_id INT REFERENCES users(user_id),
//     recipe_id INT REFERENCES recipes(recipe_id)
// );

router.get("/sort/stars/:page/:limit", async (req, res) => {
  try {
    const { page, limit } = req.params;

    !page ? (page = 1) : page;
    !limit ? (limit = 20) : limit;

    const offset = (page - 1) * limit;

    //Grab all stars, find count of recipe_id, sort by count, limit and paginate

    const sortedByStar = await pool.query(
      "SELECT recipe_id, COUNT(recipe_id) FROM user_stars GROUP BY recipe_id ORDER BY COUNT(recipe_id) DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recipe by id

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await pool.query(
      "SELECT * FROM recipes WHERE recipe_id = $1",
      [id]
    );

    const ingredients = await pool.query(
      "SELECT * FROM ingredients WHERE recipe_id = $1",
      [id]
    );

    const instructions = await pool.query(
      "SELECT * FROM instructions WHERE recipe_id = $1",
      [id]
    );

    const recipeObject = {
      recipe_id: recipe.rows[0].recipe_id,
      title: recipe.rows[0].title,
      description: recipe.rows[0].description,
      user_id: recipe.rows[0].user_id,
      image: recipe.rows[0].image,
      tags: recipe.rows[0].tags,
      preparation_time: recipe.rows[0].preparation_time,
      cooking_time: recipe.rows[0].cooking_time,
      servings: recipe.rows[0].servings,
      difficulty_level: recipe.rows[0].difficulty_level,
      ingredients: ingredients.rows,
      instructions: instructions.rows,
    };

    res.status(200).json(recipeObject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update recipe (note to frontend: send full data object)

router.put("/:id", checkValidForm, async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      image,
      tags,
      preparation_time,
      cooking_time,
      servings,
      difficulty_level,
      ingredients,
      instructions,
    } = req.body;

    const user_id = req.user;
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function checkValidForm(req, res, next) {
  try {
    if (!req.body.title) {
      return res.status(400).json({ msg: "Title is required." });
    }
    if (!req.body.description) {
      return res.status(400).json({ msg: "Description is required." });
    }
    if (!req.body.preparation_time) {
      return res.status(400).json({ msg: "Preparation time is required." });
    }
    if (!req.body.cooking_time) {
      return res.status(400).json({ msg: "Cooking time is required." });
    }
    if (!req.body.servings) {
      return res.status(400).json({ msg: "Servings are required." });
    }
    if (!req.body.difficulty_level) {
      return res.status(400).json({ msg: "Difficulty level is required." });
    }
    if (!req.body.ingredients) {
      return res.status(400).json({ msg: "Ingredients are required." });
    }
    if (!req.body.instructions) {
      return res.status(400).json({ msg: "Instructions are required." });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Ingredients routes

// CREATE TABLE IF NOT EXISTS ingredients (
//     ingredient_id SERIAL PRIMARY KEY,
//     recipe_id INT REFERENCES recipes(recipe_id),
//     name VARCHAR(80) NOT NULL,
//     quantity NUMERIC NOT NULL,
//     unit VARCHAR(50) NOT NULL
// );

// Instructions routes

// CREATE TABLE IF NOT EXISTS instructions (
//     instruction_id SERIAL PRIMARY KEY,
//     recipe_id INT REFERENCES recipes(recipe_id),
//     step_number INT NOT NULL,
//     description TEXT NOT NULL,
//     image VARCHAR(200)
// );

// Recipe versions routes

// CREATE TABLE IF NOT EXISTS recipe_versions (
//     version_id SERIAL PRIMARY KEY,
//     original_recipe_id INT REFERENCES recipes(recipe_id),
//     version_number INT NOT NULL,
//     recipe_id INT REFERENCES recipes(recipe_id),
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

module.exports = router;
