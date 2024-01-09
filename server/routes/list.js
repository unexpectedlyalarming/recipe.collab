const express = require("express");
const router = express.Router();
const pool = require("../db");

// Lists

// Get all lists by user id

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const lists = await pool.query("SELECT * FROM lists WHERE user_id = $1", [
      userId,
    ]);

    res.status(200).json(lists.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all recipes in a list

router.get("/recipes/:listId", async (req, res) => {
  try {
    const { listId } = req.params;
    const recipes = await pool.query(
      "SELECT * FROM list_recipes WHERE list_id = $1",
      [listId]
    );

    res.status(200).json(recipes.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create list

router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.user_id;

    const list = await pool.query(
      "INSERT INTO lists (user_id, name, description) VALUES ($1, $2, $3) RETURNING *",
      [userId, name, description]
    );

    res.status(200).json(list.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add recipe to list

router.post("/recipe/:listId/:recipeId", async (req, res) => {
  try {
    const { listId, recipeId } = req.params;

    const list = await pool.query("SELECT * FROM lists WHERE list_id = $1", [
      listId,
    ]);

    if (list.rows.length === 0) {
      return res.status(404).json({ msg: "List does not exist." });
    }

    if (list.rows[0].user_id !== req.user.user_id) {
      return res.status(401).json({ msg: "Not authorized." });
    }

    const recipe = await pool.query(
      "SELECT * FROM recipes WHERE recipe_id = $1",
      [recipeId]
    );

    if (recipe.rows.length === 0) {
      return res.status(404).json({ msg: "Recipe does not exist." });
    }

    const listRecipe = await pool.query(
      "SELECT * FROM list_recipes WHERE list_id = $1 AND recipe_id = $2",
      [listId, recipeId]
    );

    if (listRecipe.rows.length > 0) {
      return res.status(400).json({ msg: "Recipe already in list." });
    }

    await pool.query(
      "INSERT INTO list_recipes (list_id, recipe_id) VALUES ($1, $2)",
      [listId, recipeId]
    );

    res.status(200).json(recipe.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove recipe from list

router.delete("/recipe/:listId/:recipeId", async (req, res) => {
  try {
    const { listId, recipeId } = req.params;

    const list = await pool.query("SELECT * FROM lists WHERE list_id = $1", [
      listId,
    ]);

    if (list.rows.length === 0) {
      return res.status(404).json({ msg: "List does not exist." });
    }

    if (list.rows[0].user_id !== req.user.user_id) {
      return res.status(401).json({ msg: "Not authorized." });
    }

    const recipe = await pool.query(
      "SELECT * FROM recipes WHERE recipe_id = $1",
      [recipeId]
    );

    if (recipe.rows.length === 0) {
      return res.status(404).json({ msg: "Recipe does not exist." });
    }

    const listRecipe = await pool.query(
      "SELECT * FROM list_recipes WHERE list_id = $1 AND recipe_id = $2",
      [listId, recipeId]
    );

    if (listRecipe.rows.length === 0) {
      return res.status(400).json({ msg: "Recipe not in list." });
    }

    await pool.query(
      "DELETE FROM list_recipes WHERE list_id = $1 AND recipe_id = $2",
      [listId, recipeId]
    );

    res.status(200).json("Recipe removed from list.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete list

router.delete("/:listId", async (req, res) => {
  try {
    const { listId } = req.params;

    const list = await pool.query("SELECT * FROM lists WHERE list_id = $1", [
      listId,
    ]);

    if (list.rows.length === 0) {
      return res.status(404).json({ msg: "List does not exist." });
    }

    if (list.rows[0].user_id !== req.user.user_id) {
      return res.status(401).json({ msg: "Not authorized." });
    }

    await pool.query("DELETE FROM lists WHERE list_id = $1", [listId]);

    res.status(200).json("List was deleted.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
