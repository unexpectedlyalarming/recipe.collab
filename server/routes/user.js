const express = require("express");

const router = express.Router();

const pool = require("../db");

//Get all users

router.get("/", async (req, res) => {
  try {
    //exclude password, email, and bio

    const users = await pool.query(
      "SELECT user_id, username, first_name, last_name, created_at, profile_pic FROM users"
    );
    res.status(200).json(users.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Get a user

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    //User profile should include all recipes, and stars, exlude password and email

    const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      id,
    ]);

    if (user.rows.length === 0) {
      return res.status(400).json({ msg: "User does not exist." });
    }

    const recipes = await pool.query(
      "SELECT * FROM recipes WHERE user_id = $1",
      [id]
    );

    const stars = await pool.query(
      "SELECT * FROM user_stars WHERE user_id = $1",
      [id]
    );

    const filteredUser = {
      username: user.rows[0].username,
      first_name: user.rows[0].first_name,
      last_name: user.rows[0].last_name,
      profile_pic: user.rows[0].profile_pic,
      created_at: user.rows[0].created_at,
      bio: user.rows[0].bio,
      recipes: recipes.rows,
      stars: stars.rows,
    };

    res.status(200).json(filteredUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Update a user

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, first_name, last_name, bio } = req.body;
    if (!username || !email || !first_name || !last_name || !bio) {
      return res.status(400).json({ msg: "Not all fields have been entered." });
    }

    const user = await pool.query("SELECT * FROM USERS WHERE user_id = $1", [
      id,
    ]);

    if (user.rows.length === 0) {
      return res.status(400).json({ msg: "User does not exist." });
    }

    if (user.rows[0].user_id !== req.user) {
      return res.status(401).json({ msg: "Not authorized." });
    }

    const updatedUser = await pool.query(
      "UPDATE users SET username = $1, email = $2, first_name = $3, last_name = $4, bio = $5 WHERE user_id = $6",
      [username, email, first_name, last_name, bio, id]
    );

    res.status(200).json("User was updated.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Delete a user

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      id,
    ]);

    if (user.rows.length === 0) {
      return res.status(400).json({ msg: "User does not exist." });
    }

    if (user.rows[0].user_id !== req.user) {
      return res.status(401).json({ msg: "Not authorized." });
    }

    const deletedUser = await pool.query(
      "DELETE FROM users WHERE user_id = $1",
      [id]
    );

    res.status(200).json("User was deleted.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
