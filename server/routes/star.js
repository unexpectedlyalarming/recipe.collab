const express = require("express");

const router = express.Router();

const pool = require("../db");

// Star/unstar recipe
router.post("/:id", async (req, res) => {
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
      return res.status(200).json("Recipe was unstarred.");
    } else {
      await pool.query(
        "INSERT INTO user_stars (recipe_id, user_id) VALUES ($1, $2)",
        [id, user_id]
      );
      return res.status(200).json("Recipe was starred.");
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
    res.status(200).json(starredRecipes.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
