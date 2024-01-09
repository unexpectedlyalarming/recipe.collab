const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all ratings for a recipe

router.get("/recipe/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const ratings = await pool.query(
      "SELECT * FROM recipe_ratings WHERE recipe_id = $1",
      [id]
    );
    res.status(200).json(ratings.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all ratings from a user

router.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const ratings = await pool.query(
      "SELECT * FROM recipe_ratings WHERE user_id = $1",
      [id]
    );
    res.status(200).json(ratings.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upsert rating

router.put("/:recipeId", async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.user_id;

    const recipe = await pool.query(
      "SELECT * FROM recipes WHERE recipe_id = $1",
      [recipeId]
    );

    if (!recipe.rows.length) {
      return res.status(404).json({ msg: "Recipe does not exist." });
    }

    const ratingExists = await pool.query(
      "SELECT * FROM recipe_ratings WHERE recipe_id = $1 AND user_id = $2",
      [recipeId, userId]
    );

    if (ratingExists.rows.length) {
      // Update rating
      const newRating = await pool.query(
        "UPDATE recipe_ratings SET rating = $1 WHERE recipe_id = $2 AND user_id = $3",
        [rating, recipeId, userId]
      );
      return res.status(200).json(newRating.rows[0]);
    }

    const newRating = await pool.query(
      "INSERT INTO recipe_ratings (user_id, recipe_id, rating) VALUES ($1, $2, $3) RETURNING *",
      [userId, recipeId, rating]
    );

    res.status(200).json(newRating.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete rating

router.delete("/:recipeId", async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.user_id;

    const recipe = await pool.query(
      "SELECT * FROM recipes WHERE recipe_id = $1",
      [recipeId]
    );

    if (!recipe.rows.length) {
      return res.status(404).json({ msg: "Recipe does not exist." });
    }

    const rating = await pool.query(
      "SELECT * FROM recipe_ratings WHERE recipe_id = $1 AND user_id = $2",
      [recipeId, userId]
    );

    if (!rating.rows.length) {
      return res.status(404).json({ msg: "Rating does not exist." });
    }

    await pool.query(
      "DELETE FROM recipe_ratings WHERE recipe_id = $1 AND user_id = $2",
      [recipeId, userId]
    );

    res.status(200).json({ msg: "Rating deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
