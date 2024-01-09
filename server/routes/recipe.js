const express = require("express");

const router = express.Router();

const pool = require("../db");

const addView = require("../utils/addView");
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

    const user_id = req.user.user_id;

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

router.get("/:id", addView, async (req, res) => {
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

    const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      recipe.rows[0].user_id,
    ]);

    const stars = await pool.query(
      "SELECT * FROM user_stars WHERE recipe_id = $1",
      [id]
    );

    const comments = await pool.query(
      "SELECT * FROM user_comments WHERE recipe_id = $1",
      [id]
    );

    const recipeObject = {
      recipe_id: recipe.rows[0].recipe_id,
      title: recipe.rows[0].title,
      description: recipe.rows[0].description,
      user_id: recipe.rows[0].user_id,
      username: user.rows[0].username,
      first_name: user.rows[0].first_name,
      last_name: user.rows[0].last_name,
      profile_pic: user.rows[0].profile_pic,
      created_at: recipe.rows[0].created_at,
      updated_at: recipe.rows[0].updated_at,
      image: recipe.rows[0].image,
      tags: recipe.rows[0].tags,
      preparation_time: recipe.rows[0].preparation_time,
      cooking_time: recipe.rows[0].cooking_time,
      servings: recipe.rows[0].servings,
      difficulty_level: recipe.rows[0].difficulty_level,
      ingredients: ingredients.rows,
      instructions: instructions.rows,
      stars: stars.rows,
      comments: comments.rows,
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

    const user_id = req.user.user_id;

    const recipe = await pool.query(
      "SELECT * FROM recipes WHERE recipe_id = $1",
      [id]
    );

    if (recipe.rows.length === 0) {
      return res.status(400).json({ msg: "Recipe does not exist." });
    }

    if (recipe.rows[0].user_id !== req.user.user_id) {
      return res.status(401).json({ msg: "Not authorized." });
    }

    const updated_at = new Date();

    const updatedRecipe = await pool.query(
      "UPDATE recipes SET title = $1, description = $2, user_id = $3, image = $4, tags = $5, preparation_time = $6, cooking_time = $7, servings = $8, difficulty_level = $9, updated_at = $10 WHERE recipe_id = $11 RETURNING *",
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
        updated_at,
        id,
      ]
    );

    //Update ingredients

    ingredients.forEach(async (ingredient) => {
      const { name, quantity, unit, ingredient_id } = ingredient;
      const newIngredient = await pool.query(
        "UPDATE ingredients SET name = $1, quantity = $2, unit = $3 WHERE recipe_id = $4 AND ingredient_id = $5 RETURNING *",
        [name, quantity, unit, id, ingredient_id]
      );
    });

    //Update instructions

    instructions.forEach(async (instruction) => {
      const { step_number, description, image, instruction_id } = instruction;
      const newInstruction = await pool.query(
        "UPDATE instructions SET step_number = $1, description = $2, image = $3 WHERE recipe_id = $4 AND instruction_id = $5 RETURNING *",
        [step_number, description, image, id, instruction_id]
      );
    });

    return res.status(200).json(updatedRecipe.rows[0]);
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

//Create recipe fork

router.post("/fork/:id", async (req, res) => {
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

    //Create new recipe and recipe version

    const newRecipe = await pool.query(
      "INSERT INTO recipes (title, description, user_id, image, tags, preparation_time, cooking_time, servings, difficulty_level) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [
        recipeObject.title,
        recipeObject.description,
        req.user.user_id,
        recipeObject.image,
        recipeObject.tags,
        recipeObject.preparation_time,
        recipeObject.cooking_time,
        recipeObject.servings,
        recipeObject.difficulty_level,
      ]
    );

    //Get old recipe version number (if exists)

    let versionNumber = 1;

    const oldRecipeVersion = await pool.query(
      "SELECT * FROM recipe_versions WHERE original_recipe_id = $1",
      [id]
    );

    if (oldRecipeVersion.rows.length > 0) {
      versionNumber = oldRecipeVersion.rows[0].version_number + 1;
    }

    const newRecipeVersion = await pool.query(
      "INSERT INTO recipe_versions (original_recipe_id, version_number, recipe_id) VALUES ($1, $2, $3) RETURNING *",
      [id, versionNumber, newRecipe.rows[0].recipe_id]
    );

    res.status(200).json(recipeObject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete recipe

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await pool.query(
      "SELECT * FROM recipes WHERE recipe_id = $1",
      [id]
    );

    if (recipe.rows.length === 0) {
      return res.status(400).json({ msg: "Recipe does not exist." });
    }

    if (recipe.rows[0].user_id !== req.user.user_id) {
      return res.status(401).json({ msg: "Not authorized." });
    }
    const deletedIngredients = await pool.query(
      "DELETE FROM ingredients WHERE recipe_id = $1",
      [id]
    );
    const deletedInstructions = await pool.query(
      "DELETE FROM instructions WHERE recipe_id = $1",
      [id]
    );
    const deletedStars = await pool.query(
      "DELETE FROM user_stars WHERE recipe_id = $1",
      [id]
    );
    const deletedComments = await pool.query(
      "DELETE FROM user_comments WHERE recipe_id = $1",
      [id]
    );

    //Set recipe_id to null in recipe_versions table

    const recipeVersion = await pool.query(
      "SELECT * FROM recipe_versions WHERE recipe_id = $1",
      [id]
    );

    if (recipeVersion.rows.length > 0) {
      const nextRecipeVersion = await pool.query(
        "SELECT * FROM recipe_versions WHERE original_recipe_id = $1 AND version_number = $2",
        [
          recipeVersion.rows[0].original_recipe_id,
          recipeVersion.rows[0].version_number + 1,
        ]
      );
      const updatedRecipeVersion = await pool.query(
        "UPDATE recipe_versions SET recipe_id = $1 WHERE recipe_id = $2",
        [nextRecipeVersion.rows[0].recipe_id, id]
      );

      const deletedRecipe = await pool.query(
        "DELETE FROM recipes WHERE recipe_id = $1",
        [id]
      );
    }

    res.status(200).json("Recipe was deleted.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Yeah, not really sure why I put this here.
//It'll move to its own route soon.
// Comments

// Create comment

// router.post("/comment/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { comment } = req.body;

//     const recipe = await pool.query(
//       "SELECT * FROM recipes WHERE recipe_id = $1",
//       [id]
//     );

//     if (recipe.rows.length === 0) {
//       return res.status(400).json({ msg: "Recipe does not exist." });
//     }

//     const newComment = await pool.query(
//       "INSERT INTO user_comments (user_id, recipe_id, comment) VALUES ($1, $2, $3) RETURNING *",
//       [req.user.user_id, id, comment]
//     );

//     res.status(200).json(newComment.rows[0]);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Edit comment

// router.put("/comment/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { comment } = req.body;

//     const recipe = await pool.query(
//       "SELECT * FROM recipes WHERE recipe_id = $1",
//       [id]
//     );

//     if (recipe.rows.length === 0) {
//       return res.status(400).json({ msg: "Recipe does not exist." });
//     }

//     const oldComment = await pool.query(
//       "SELECT * FROM user_comments WHERE user_id = $1 AND recipe_id = $2",
//       [req.user.user_id, id]
//     );

//     if (oldComment.rows.length === 0) {
//       return res.status(400).json({ msg: "Comment does not exist." });
//     }

//     const updated_at = new Date();

//     const newComment = await pool.query(
//       "UPDATE user_comments SET comment = $1, updated_at = $2 WHERE user_id = $3 AND recipe_id = $4 RETURNING *",
//       [comment, updated_at, req.user.user_id, id]
//     );

//     res.status(200).json(newComment.rows[0]);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Delete comment

// router.delete("/comment/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     const oldComment = await pool.query(
//       "SELECT * FROM user_comments WHERE user_id = $1 AND recipe_id = $2",
//       [req.user.user_id, id]
//     );

//     if (oldComment.rows.length === 0) {
//       return res.status(400).json({ msg: "Comment does not exist." });
//     }

//     await pool.query(
//       "DELETE FROM user_comments WHERE user_id = $1 AND recipe_id = $2",
//       [req.user.user_id, id]
//     );

//     res.status(200).json("Comment was deleted.");
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

module.exports = router;
