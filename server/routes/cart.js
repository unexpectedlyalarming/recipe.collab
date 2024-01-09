const express = require("express");
const router = express.Router();
const pool = require("../db");
const convert = require("convert-units");

//Get cart by user id

router.get("/", async (req, res) => {
  try {
    const cart = await pool.query(
      "SELECT * FROM user_carts WHERE user_id = $1",
      [req.user.user_id]
    );

    res.status(200).json(cart.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Add recipe to cart

router.post("/:recipeId", async (req, res) => {
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

    const cart = await pool.query(
      `
        INSERT INTO user_carts (user_id, recipe_id)
        `
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Remove recipe from cart

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

    const cart = await pool.query(
      `
            DELETE FROM user_carts
            WHERE user_id = $1 AND recipe_id = $2
            `,
      [userId, recipeId]
    );

    res.status(200).json("Recipe removed from cart.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear cart

router.delete("/", async (req, res) => {
  try {
    const userId = req.user.user_id;

    const cart = await pool.query(
      `
        DELETE FROM user_carts
        WHERE user_id = $1
        `,
      [userId]
    );

    res.status(200).json("Cart cleared.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Return total recipe measurements from all recipes in cart

router.get("/measurements", async (req, res) => {
  try {
    const userId = req.user.user_id;

    const cart = await pool.query(
      `
            SELECT * FROM user_carts
            WHERE user_id = $1
            `,
      [userId]
    );

    if (!cart.rows.length) {
      return res.status(404).json({ msg: "Cart is empty." });
    }

    const recipeIds = cart.rows.map((recipe) => recipe.recipe_id);

    let measurements = {};

    //Simple conversion

    for (const recipeId of recipeIds) {
      const ingredients = await pool.query(
        `
          SELECT * FROM ingredients WHERE recipe_id = $1
           `,
        [recipeId]
      );

      for (const ingredient of ingredients.rows) {
        if (
          measurements[ingredient.name] &&
          measurements[ingredient.name].unit === ingredient.unit
        ) {
          measurements[ingredient.name].quantity += ingredient.quantity;
        } else if (
          measurements[ingredient.name] &&
          measurements[ingredient.name].unit !== ingredient.unit
        ) {
          const convertedQuantity = convert(ingredient.quantity)
            .from(ingredient.unit)
            .to(measurements[ingredient.name].unit);
          measurements[ingredient.name] = {
            quantity:
              measurements[ingredient.name].quantity + convertedQuantity,
            unit: measurements[ingredient.name].unit,
          };
        } else {
          measurements[ingredient.name] = {
            quantity: ingredient.quantity,
            unit: ingredient.unit,
          };
        }
      }
    }

    //Step by step breakdown incase conversion is wrong

    let fullIngredients = {};

    for (const recipeId of recipeIds) {
      const ingredients = await pool.query(
        `
            SELECT * FROM ingredients WHERE recipe_id = $1
             `,
        [recipeId]
      );

      fullIngredients.push(ingredients.rows);
    }

    res.status(200).json({ measurements, fullIngredients });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// CREATE TABLE IF NOT EXISTS user_carts (
//     cart_id SERIAL PRIMARY KEY,
//     user_id INT REFERENCES users(user_id),
//     recipe_id INT REFERENCES recipes(recipe_id),
//     UNIQUE(user_id, recipe_id)
// );
