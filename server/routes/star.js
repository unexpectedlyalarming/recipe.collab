const express = require("express");

const router = express.Router();

const pool = require("../db");

// Star/unstar recipe
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;

    const recipe = await pool.query(
      "SELECT * FROM recipes WHERE recipe_id = $1",
      [id]
    );

    if (recipe.rows.length === 0) {
      return res.status(400).json({ msg: "Recipe does not exist." });
    }

    const starredRecipe = await pool.query(
      "SELECT * FROM user_stars WHERE recipe_id = $1 AND user_id = $2",
      [id, user_id]
    );

    if (starredRecipe.rows.length > 0) {
      await pool.query(
        "DELETE FROM user_stars WHERE recipe_id = $1 AND user_id = $2",
        [id, user_id]
      );
      //Unstar
      return res.status(200).json(false);
    } else {
      await pool.query(
        "INSERT INTO user_stars (recipe_id, user_id) VALUES ($1, $2)",
        [id, user_id]
      );
      //Star

      //Boolean for frontend ease of use
      return res.status(200).json(true);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get starred recipes

router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const starredRecipes = await pool.query(
      "SELECT * FROM user_stars WHERE user_id = $1",
      [userId]
    );

    const starredRecipeIds = starredRecipes.rows.map(
      (recipe) => recipe.recipe_id
    );

    const recipes = await pool.query(
      "SELECT * FROM recipes WHERE recipe_id = ANY($1)",
      [starredRecipeIds]
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

      recipe.stars = stars.rows;
      recipe.views = views.rows;
      recipe.comments = comments.rows;
    }

    res.status(200).json(recipes.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get starred recipes by recipe id

router.get("/recipe/:recipeId", async (req, res) => {
  try {
    const { recipeId } = req.params;
    const starredRecipes = await pool.query(
      "SELECT * FROM user_stars WHERE recipe_id = $1",
      [recipeId]
    );
    res.status(200).json(starredRecipes.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users who starred a recipe

router.get("/recipe/:recipeId/users", async (req, res) => {
  try {
    const { recipeId } = req.params;
    const starredRecipes = await pool.query(
      "SELECT * FROM user_stars WHERE recipe_id = $1",
      [recipeId]
    );
    res.status(200).json(starredRecipes.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
