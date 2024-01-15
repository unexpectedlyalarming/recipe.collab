const pool = require("../db");

async function addView(req, res, next) {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;

    if (!id) {
      next();
    }
    if (!user_id) {
      next();
    }
    const recipe = await pool.query(
      "SELECT * FROM recipes WHERE recipe_id = $1",
      [id]
    );
    if (recipe.rows.length === 0) {
      return res.status(404).json({ msg: "Recipe does not exist." });
    }

    const viewedRecipe = await pool.query(
      "SELECT * FROM recipe_views WHERE recipe_id = $1 AND user_id = $2",
      [id, user_id]
    );

    if (viewedRecipe.rows.length === 0) {
      await pool.query(
        "INSERT INTO recipe_views (recipe_id, user_id) VALUES ($1, $2)",
        [id, user_id]
      );
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = addView;
