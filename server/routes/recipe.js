const express = require("express");

const router = express.Router();

const pool = require("../db");

const addView = require("../utils/addView");

const rateLimit = require("express-rate-limit");

const _ = require("lodash");

const uploadReturnURL = require("../utils/uploadReturnURL");

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

const creationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
});

// Create recipe

router.post(
  "/",
  checkValidForm,
  creationLimiter,
  uploadReturnURL,
  async (req, res) => {
    try {
      const {
        title,
        description,
        tags,
        preparation_time,
        cooking_time,
        servings,
        difficulty_level,
        ingredients,
        instructions,
      } = req.body;

      let image = req.fileUrl ? req.fileUrl : req.body.image;

      const user_id = req.user.user_id;

      //Include tags in recipe_tags table and in recipe object

      const newRecipe = await pool.query(
        "INSERT INTO recipes (title, description, user_id, image, preparation_time, cooking_time, servings, difficulty_level, tags) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
        [
          title,
          description,
          user_id,
          image,
          preparation_time,
          cooking_time,
          servings,
          difficulty_level,
          tags,
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

      if (tags) {
        tags.forEach(async (tag) => {
          tag = _.startCase(tag);
          const newTag = await pool.query(
            "INSERT INTO recipe_tags (recipe_id, tag) VALUES ($1, $2) RETURNING *",
            [recipe_id, tag]
          );
        });
      }

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
  }
);

// Get recipes, sort by date, limit and paginate

router.get("/sort/date/:page/:limit", async (req, res) => {
  try {
    let { page, limit } = req.params;

    page = page ? page : 1;
    limit = limit ? limit : 20;

    const offset = (page - 1) * limit;
    const recipes = await pool.query(
      "SELECT * FROM recipes ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    // add stars, views, comments, ratings

    for (let recipe of recipes.rows) {
      const stars = await pool.query(
        "SELECT * FROM user_stars WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      const views = await pool.query(
        "SELECT * FROM recipe_views WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      const comments = await pool.query(
        "SELECT * FROM user_comments WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      const average = getAverageRatingByRecipeId(recipe.recipe_id);

      recipe.stars = stars.rows;
      recipe.views = views.rows;
      recipe.comments = comments.rows;
      recipe.rating = average;
    }

    res.status(200).json(recipes.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recipes, sort by user_stars, limit and paginate

router.get("/sort/stars/:page/:limit", async (req, res) => {
  try {
    let { page, limit } = req.params;

    page = page ? page : 1;
    limit = limit ? limit : 20;

    const offset = (page - 1) * limit;

    const sortedByStar = await pool.query(
      "SELECT recipe_id, COUNT(recipe_id) FROM user_stars GROUP BY recipe_id ORDER BY COUNT(recipe_id) DESC LIMIT $1 OFFSET $2 ",
      [limit, offset]
    );

    let recipes = [];

    for (let recipe of sortedByStar.rows) {
      let newRecipe = await pool.query(
        "SELECT * FROM recipes WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      recipes.push(newRecipe.rows[0]);
    }

    for (let recipe of recipes) {
      const stars = await pool.query(
        "SELECT * FROM user_stars WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      const views = await pool.query(
        "SELECT * FROM recipe_views WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      const comments = await pool.query(
        "SELECT * FROM user_comments WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      const average = getAverageRatingByRecipeId(recipe.recipe_id);

      recipe.stars = stars.rows;
      recipe.views = views.rows;
      recipe.comments = comments.rows;
      recipe.rating = average;
    }

    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recipes, sort by recipe_ratings, limit and paginate

router.get("/sort/rating/:page/:limit", async (req, res) => {
  try {
    const { page, limit } = req.params;

    !page ? (page = 1) : page;
    !limit ? (limit = 20) : limit;

    const offset = (page - 1) * limit;

    const sortedByRating = await pool.query(
      "SELECT recipe_id, AVG(rating) FROM recipe_ratings GROUP BY recipe_id ORDER BY AVG(rating) DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    let recipes = [];

    for (let recipe of sortedByRating.rows) {
      let newRecipe = await pool.query(
        "SELECT * FROM recipes WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      recipes.push(newRecipe.rows[0]);
    }

    for (let recipe of recipes) {
      const stars = await pool.query(
        "SELECT * FROM user_stars WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      const views = await pool.query(
        "SELECT * FROM recipe_views WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      const comments = await pool.query(
        "SELECT * FROM user_comments WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      const average = getAverageRatingByRecipeId(recipe.recipe_id);

      recipe.stars = stars.rows;
      recipe.views = views.rows;
      recipe.comments = comments.rows;
      recipe.rating = average;
    }

    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recipes, sort by recipe_views, limit and paginate

router.get("/sort/views/:page/:limit", async (req, res) => {
  try {
    const { page, limit } = req.params;

    !page ? (page = 1) : page;
    !limit ? (limit = 20) : limit;

    const offset = (page - 1) * limit;

    const sortedByViews = await pool.query(
      "SELECT recipe_id, COUNT(recipe_id) FROM recipe_views GROUP BY recipe_id ORDER BY COUNT(recipe_id) DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    let recipes = [];

    for (let recipe of sortedByViews.rows) {
      let newRecipe = await pool.query(
        "SELECT * FROM recipes WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      recipes.push(newRecipe.rows[0]);
    }

    for (let recipe of recipes) {
      const stars = await pool.query(
        "SELECT * FROM user_stars WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      const views = await pool.query(
        "SELECT * FROM recipe_views WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      const comments = await pool.query(
        "SELECT * FROM user_comments WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      const average = getAverageRatingByRecipeId(recipe.recipe_id);

      recipe.stars = stars.rows;
      recipe.views = views.rows;
      recipe.comments = comments.rows;
      recipe.rating = average;
    }

    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recipes, filter by following, sort by date, limit and paginate

router.get("/sort/following/:page/:limit", async (req, res) => {
  try {
    let { page, limit } = req.params;

    page = page ? page : 1;
    limit = limit ? limit : 20;

    const offset = (page - 1) * limit;

    const following = await pool.query(
      "SELECT * FROM user_follows WHERE follower_id = $1",
      [req.user.user_id]
    );
    console.log(following.rows);
    const followingIds = following.rows.map((follow) => follow.user_id);

    const recipes = await pool.query(
      "SELECT * FROM recipes WHERE user_id = ANY($1) ORDER BY created_at DESC LIMIT $2 OFFSET $3",
      [followingIds, limit, offset]
    );

    for (let recipe of recipes.rows) {
      const stars = await pool.query(
        "SELECT * FROM user_stars WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      const views = await pool.query(
        "SELECT * FROM recipe_views WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      const comments = await pool.query(
        "SELECT * FROM user_comments WHERE recipe_id = $1",
        [recipe.recipe_id]
      );

      const average = getAverageRatingByRecipeId(recipe.recipe_id);

      recipe.stars = stars.rows;
      recipe.views = views.rows;
      recipe.comments = comments.rows;
      recipe.rating = average;
    }

    res.status(200).json(recipes.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recipes, filter by inputed tag, sort by stars, limit and paginate

router.get("/sort/tag/:tag/:page/:limit", async (req, res) => {
  try {
    let { page, limit, tag } = req.params;

    page = page ? page : 1;
    limit = limit ? limit : 20;

    const offset = (page - 1) * limit;

    const recipes = await pool.query(
      "SELECT * FROM recipes WHERE $1 = ANY (tags) ORDER BY created_at DESC LIMIT $2 OFFSET $3",
      [tag, limit, offset]
    );

    for (let recipe of recipes.rows) {
      const stars = await pool.query(
        "SELECT * FROM user_stars WHERE recipe_id = $1",
        [recipe.recipe_id]
      );

      const views = await pool.query(
        "SELECT * FROM recipe_views WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      const comments = await pool.query(
        "SELECT * FROM user_comments WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      const average = getAverageRatingByRecipeId(recipe.recipe_id);

      recipe.stars = stars.rows;
      recipe.views = views.rows;
      recipe.comments = comments.rows;
      recipe.rating = average;
    }

    recipes.rows.sort((a, b) => {
      return b.stars.length - a.stars.length;
    });

    const recipeCount = await pool.query(
      "SELECT COUNT(*) FROM recipes WHERE $1 = ANY (tags)",
      [tag]
    );

    const pageCount = Math.ceil(recipeCount.rows[0].count / limit);

    res.status(200).json({ recipes: recipes.rows, pageCount });
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

    if (recipe.rows.length === 0) {
      return res.status(400).json({ msg: "Recipe does not exist." });
    }

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

    const views = await pool.query(
      "SELECT * FROM recipe_views WHERE recipe_id = $1",
      [id]
    );

    const average = await getAverageRatingByRecipeId(id);

    const recipeVersionForks = await pool.query(
      "SELECT * FROM recipe_versions WHERE recipe_id = $1",
      [id]
    );

    const originalRecipeForks = await pool.query(
      "SELECT * FROM recipe_versions WHERE original_recipe_id = $1",
      [id]
    );

    const recipeVersion = await pool.query(
      "SELECT * FROM recipe_versions WHERE recipe_id = $1",
      [id]
    );
    let version_number = recipeVersion.rows[0]
      ? recipeVersion?.rows[0]?.version_number
      : 1;

    const forks = [...originalRecipeForks.rows, ...recipeVersionForks.rows];

    let originalRecipeId;
    let isForkOfCurrentUser = false;
    if (recipeVersion.rows[0]) {
      originalRecipeId = recipeVersion.rows[0].original_recipe_id;
      const getUserIdFromRecipeId = await pool.query(
        "SELECT user_id FROM recipes WHERE recipe_id = $1",
        [originalRecipeId]
      );

      if (getUserIdFromRecipeId.rows[0].user_id === req.user.user_id) {
        isForkOfCurrentUser = true;
      }
    }

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
      views: views.rows,
      rating: average,
      forks,
      version_number,
      isForkOfCurrentUser,
    };

    res.status(200).json(recipeObject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update recipe (note to frontend: send full data object)

router.put("/:id", checkValidForm, uploadReturnURL, async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,

      tags,
      preparation_time,
      cooking_time,
      servings,
      difficulty_level,
      ingredients,
      instructions,
    } = req.body;

    let image = req.fileUrl ? req.fileUrl : req.body.image;

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

    const deletedTags = await pool.query(
      "DELETE FROM recipe_tags WHERE recipe_id = $1",
      [id]
    );

    tags.forEach(async (tag) => {
      const newTag = await pool.query(
        "INSERT INTO recipe_tags (recipe_id, tag) VALUES ($1, $2) RETURNING *",
        [id, tag]
      );
    });

    const updatedRecipe = await pool.query(
      "UPDATE recipes SET title = $1, description = $2, user_id = $3, image = $4, tags = $5, preparation_time = $6, cooking_time = $7, servings = $8, difficulty_level = $9, updated_at = $10, tags = $11 WHERE recipe_id = $12 RETURNING *",
      [
        title,
        description,
        user_id,
        image,
        preparation_time,
        cooking_time,
        servings,
        difficulty_level,
        updated_at,
        tags,
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

router.post("/fork/:id", uploadReturnURL, async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,

      tags,
      preparation_time,
      cooking_time,
      servings,
      difficulty_level,
      ingredients,
      instructions,
    } = req.body;

    let image = req.fileUrl ? req.fileUrl : req.body.image;

    const recipe = await pool.query(
      "SELECT * FROM recipes WHERE recipe_id = $1",
      [id]
    );
    if (recipe.rows.length === 0) {
      return res.status(400).json({ msg: "Recipe does not exist." });
    }

    const recipeObject = {
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
    };

    //Create new recipe and recipe version

    const newRecipe = await pool.query(
      "INSERT INTO recipes (title, description, user_id, image, preparation_time, cooking_time, servings, difficulty_level, tags) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [
        recipeObject.title,
        recipeObject.description,
        req.user.user_id,
        recipeObject.image,
        recipeObject.preparation_time,
        recipeObject.cooking_time,
        recipeObject.servings,
        recipeObject.difficulty_level,
        recipeObject.tags,
      ]
    );

    //Create ingredients

    recipeObject.ingredients.forEach(async (ingredient) => {
      const { name, quantity, unit } = ingredient;
      const newIngredient = await pool.query(
        "INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES ($1, $2, $3, $4) RETURNING *",
        [newRecipe.rows[0].recipe_id, name, quantity, unit]
      );
    });

    //Create instructions

    recipeObject.instructions.forEach(async (instruction) => {
      const { step_number, description, image } = instruction;
      const newInstruction = await pool.query(
        "INSERT INTO instructions (recipe_id, step_number, description, image) VALUES ($1, $2, $3, $4) RETURNING *",
        [newRecipe.rows[0].recipe_id, step_number, description, image]
      );
    });

    recipeObject.tags.forEach(async (tag) => {
      tag = _.startCase(tag);
      const newTag = await pool.query(
        "INSERT INTO recipe_tags (recipe_id, tag) VALUES ($1, $2) RETURNING *",
        [newRecipe.rows[0].recipe_id, tag]
      );
    });

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

    res.status(200).json(newRecipe.rows[0]);
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

    const deletedTags = await pool.query(
      "DELETE FROM recipe_tags WHERE recipe_id = $1",
      [id]
    );

    const deletedLists = await pool.query(
      "DELETE FROM list_recipes WHERE recipe_id = $1",
      [id]
    );
    const deletedCarts = await pool.query(
      "DELETE FROM user_carts WHERE recipe_id = $1",
      [id]
    );

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

// Get count of all tags, sorted by count (desc), limit and paginate. Return count and tag name.

router.get("/tags/:page/:limit/:query?", async (req, res) => {
  try {
    let { page, limit, query } = req.params;

    page = page ? page : 1;
    limit = limit ? limit : 20;

    const offset = (page - 1) * limit;
    //decode uri
    query = query ? _.startCase(decodeURIComponent(query)) : null;
    console.log(query);

    let tags;
    if (query) {
      tags = await pool.query(
        "SELECT tag, COUNT(tag) FROM recipe_tags WHERE tag LIKE $1 GROUP BY tag ORDER BY COUNT(tag) DESC LIMIT $2 OFFSET $3",
        [`%${query}%`, limit, offset]
      );
    } else {
      tags = await pool.query(
        "SELECT tag, COUNT(tag) FROM recipe_tags GROUP BY tag ORDER BY COUNT(tag) DESC LIMIT $1 OFFSET $2",
        [limit, offset]
      );
    }

    res.status(200).json(tags.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Get recipe by user_id

router.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const recipes = await pool.query(
      "SELECT * FROM recipes WHERE user_id = $1",
      [id]
    );

    for (let recipe of recipes.rows) {
      const stars = await pool.query(
        "SELECT * FROM user_stars WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      const views = await pool.query(
        "SELECT * FROM recipe_views WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      const comments = await pool.query(
        "SELECT * FROM user_comments WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      const average = getAverageRatingByRecipeId(recipe.recipe_id);

      recipe.stars = stars.rows;
      recipe.views = views.rows;
      recipe.comments = comments.rows;
      recipe.rating = average;
    }

    res.status(200).json(recipes.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function getAverageRatingByRecipeId(recipe_id) {
  try {
    const ratings = await pool.query(
      "SELECT * FROM user_ratings WHERE recipe_id = $1",
      [recipe_id]
    );

    let total = 0;

    ratings.rows.forEach((rating) => {
      total += rating.rating;
    });

    const average = total / ratings.rows.length;

    return average;
  } catch (error) {
    return error;
  }
}

// Regex search for recipes

router.get("/search/:query/:page/:limit/:sort?", async (req, res) => {
  try {
    let { query, page, limit, sort } = req.params;
    page = page ? page : 1;
    limit = limit ? limit : 20;

    const offset = (page - 1) * limit;

    query = query ? decodeURIComponent(query) : null;

    if (!sort) {
      sort = "date";
    }

    let recipes;

    switch (sort) {
      case "date":
        recipes = await pool.query(
          "SELECT * FROM recipes WHERE title ILIKE $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
          [`%${query}%`, limit, offset]
        );

        break;
      case "stars":
        recipes = await pool.query(
          "SELECT * FROM recipes WHERE title ILIKE $1 ORDER BY (SELECT COUNT(*) FROM user_stars WHERE user_stars.recipe_id = recipes.recipe_id) DESC LIMIT $2 OFFSET $3",
          [`%${query}%`, limit, offset]
        );
        break;
      case "views":
        recipes = await pool.query(
          "SELECT * FROM recipes WHERE title ILIKE $1 ORDER BY (SELECT COUNT(*) FROM recipe_views WHERE recipe_views.recipe_id = recipes.recipe_id) DESC LIMIT $2 OFFSET $3",
          [`%${query}%`, limit, offset]
        );
        break;
      case "forks":
        recipes = await pool.query(
          "SELECT * FROM recipes WHERE title ILIKE $1 ORDER BY (SELECT COUNT(*) FROM recipe_versions WHERE recipe_versions.original_recipe_id = recipes.recipe_id) DESC LIMIT $2 OFFSET $3",
          [`%${query}%`, limit, offset]
        );
        break;
      default:
        recipes = await pool.query(
          "SELECT * FROM recipes WHERE title ILIKE $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
          [`%${query}%`, limit, offset]
        );
        break;
    }

    for (let recipe of recipes.rows) {
      const stars = await pool.query(
        "SELECT * FROM user_stars WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      const views = await pool.query(
        "SELECT * FROM recipe_views WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      const comments = await pool.query(
        "SELECT * FROM user_comments WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      const average = getAverageRatingByRecipeId(recipe.recipe_id);

      recipe.stars = stars.rows;
      recipe.views = views.rows;
      recipe.comments = comments.rows;
      recipe.rating = average;
    }

    const recipeCount = await pool.query(
      "SELECT COUNT(*) FROM recipes WHERE title ILIKE $1",
      [`%${query}%`]
    );

    const pageCount = Math.ceil(recipeCount.rows[0].count / limit);

    res.status(200).json({ recipes: recipes.rows, pageCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RECIPE FORK RELATED ROUTES

// Get unaccepted recipe versions for user

router.get("/versions/unaccepted", async (req, res) => {
  try {
    const userId = req.user.user_id;

    const recipeVersions = await pool.query(
      "SELECT * FROM recipe_versions WHERE original_recipe_id IN (SELECT recipe_id FROM recipes WHERE user_id = $1) AND recipe_id NOT IN (SELECT recipe_id FROM recipes WHERE user_id = $1)",
      [userId]
    );

    const recipes = [];

    for (let recipe of recipeVersions.rows) {
      const newRecipe = await pool.query(
        "SELECT * FROM recipes WHERE recipe_id = $1",
        [recipe.recipe_id]
      );
      recipes.push(newRecipe.rows[0]);
    }

    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept recipe version/merge

router.patch("/versions/accept/:id", async (req, res) => {
  try {
    const userId = req.user.user_id;

    const { id } = req.params;

    const recipeVersion = await pool.query(
      "SELECT * FROM recipe_versions WHERE recipe_id = $1",
      [id]
    );

    const originalRecipe = await pool.query(
      "SELECT * FROM recipes WHERE recipe_id = $1",
      [recipeVersion.rows[0].original_recipe_id]
    );

    const recipe = await pool.query(
      "SELECT * FROM recipes WHERE recipe_id = $1",
      [id]
    );

    if (recipe.rows.length === 0) {
      return res.status(400).json({ msg: "Recipe does not exist." });
    }

    if (originalRecipe.rows[0].user_id !== userId) {
      return res.status(401).json({ msg: "Not authorized." });
    }

    const updatedRecipe = await pool.query(
      "UPDATE recipes SET title = $1, description = $2, user_id = $3, image = $4, preparation_time = $5, cooking_time = $6, servings = $7, difficulty_level = $8, updated_at = $9, tags = $10 WHERE recipe_id = $11 RETURNING *",
      [
        recipe.rows[0].title,
        recipe.rows[0].description,
        recipe.rows[0].user_id,
        recipe.rows[0].image,
        recipe.rows[0].preparation_time,
        recipe.rows[0].cooking_time,
        recipe.rows[0].servings,
        recipe.rows[0].difficulty_level,
        recipe.rows[0].updated_at,
        recipe.rows[0].tags,
        recipe.rows[0].recipe_id,
      ]
    );

    //Update ingredients

    const ingredients = await pool.query(
      "SELECT * FROM ingredients WHERE recipe_id = $1",
      [id]
    );

    ingredients.rows.forEach(async (ingredient) => {
      const { name, quantity, unit, ingredient_id } = ingredient;
      const newIngredient = await pool.query(
        "UPDATE ingredients SET name = $1, quantity = $2, unit = $3 WHERE recipe_id = $4 AND ingredient_id = $5 RETURNING *",
        [name, quantity, unit, id, ingredient_id]
      );
    });

    //Update instructions

    const instructions = await pool.query(
      "SELECT * FROM instructions WHERE recipe_id = $1",
      [id]
    );

    instructions.rows.forEach(async (instruction) => {
      const { step_number, description, image, instruction_id } = instruction;
      const newInstruction = await pool.query(
        "UPDATE instructions SET step_number = $1, description = $2, image = $3 WHERE recipe_id = $4 AND instruction_id = $5 RETURNING *",
        [step_number, description, image, id, instruction_id]
      );
    });

    //Update tags

    const tags = await pool.query(
      "SELECT * FROM recipe_tags WHERE recipe_id = $1",
      [id]
    );

    tags.rows.forEach(async (tag) => {
      const newTag = await pool.query(
        "UPDATE recipe_tags SET tag = $1 WHERE recipe_id = $2 RETURNING *",
        [tag.tag, id]
      );
    });

    //Delete recipe version

    const deletedRecipeVersion = await pool.query(
      "DELETE FROM recipe_versions WHERE recipe_id = $1",
      [id]
    );

    //Update recipe version number

    const recipeVersionNumber = await pool.query(
      "SELECT * FROM recipe_versions WHERE original_recipe_id = $1",
      [id]
    );

    if (recipeVersionNumber.rows.length > 0) {
      recipeVersionNumber.rows.forEach(async (version) => {
        const updatedRecipeVersionNumber = await pool.query(
          "UPDATE recipe_versions SET version_number = $1 WHERE recipe_id = $2",
          [version.version_number - 1, version.recipe_id]
        );
      });
    }

    res.status(200).json(updatedRecipe.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recipe versions of original recipe

router.get("/versions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const recipeVersions = await pool.query(
      "SELECT * FROM recipe_versions WHERE original_recipe_id = $1",
      [id]
    );

    res.status(200).json(recipeVersions.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get original recipe of recipe version

router.get("/versions/original/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const recipeVersion = await pool.query(
      "SELECT * FROM recipe_versions WHERE recipe_id = $1",
      [id]
    );

    const originalRecipe = await pool.query(
      "SELECT * FROM recipes WHERE recipe_id = $1",
      [recipeVersion.rows[0].original_recipe_id]
    );

    res.status(200).json(originalRecipe.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
