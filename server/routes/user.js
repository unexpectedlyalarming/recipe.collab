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

    const ratings = await pool.query(
      "SELECT * FROM recipe_ratings WHERE user_id = $1",
      [id]
    );

    const followers = await pool.query(
      "SELECT * FROM user_follows WHERE user_id = $1",
      [id]
    );

    const following = await pool.query(
      "SELECT * FROM user_follows WHERE follower_id = $1",
      [id]
    );

    const filteredUser = {
      username: user.rows[0].username,
      first_name: user.rows[0].first_name,
      last_name: user.rows[0].last_name,
      profile_pic: user.rows[0].profile_pic,
      created_at: user.rows[0].created_at,
      last_active: user.rows[0].last_active,
      is_active: user.rows[0].is_active,
      isAdmin: user.rows[0].isAdmin,
      user_id: user.rows[0].user_id,
      bio: user.rows[0].bio,
      recipes: recipes.rows,
      stars: stars.rows,
      ratings: ratings.rows,
      followers: followers.rows,
      following: following.rows,
    };

    res.status(200).json(filteredUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Update a user

//TODO: Decide whether to allow users to update their username and email
//ALSO TODO: Decide whether password is input in req.body, or if I should fetch it from the db.

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, first_name, last_name, bio, profile_pic } =
      req.body;
    console.log("put request: ", req.body);
    if (
      !req.body.username ||
      !req.body.email ||
      !req.body.first_name ||
      !req.body.last_name ||
      !req.body.bio ||
      !req.body.profile_pic
    ) {
      return res.status(402).json({ msg: "Not all fields have been entered." });
    }

    const user = await pool.query("SELECT * FROM USERS WHERE user_id = $1", [
      id,
    ]);

    if (user.rows.length === 0) {
      return res.status(404).json({ msg: "User does not exist." });
    }

    if (user.rows[0].user_id !== req.user.user_id) {
      return res.status(401).json({ msg: "Not authorized." });
    }

    const updatedUser = await pool.query(
      "UPDATE users SET username = $1, email = $2, first_name = $3, last_name = $4, bio = $5, profile_pic = $6 WHERE user_id = $7 RETURNING *",
      [username, email, first_name, last_name, bio, profile_pic, id]
    );

    const filteredUser = {
      username: updatedUser.rows[0].username,
      email: updatedUser.rows[0].email,
      first_name: updatedUser.rows[0].first_name,
      last_name: updatedUser.rows[0].last_name,
      bio: updatedUser.rows[0].bio,
      profile_pic: updatedUser.rows[0].profile_pic,
      user_id: updatedUser.rows[0].user_id,
      created_at: updatedUser.rows[0].created_at,
      last_active: updatedUser.rows[0].last_active,
      isActive: updatedUser.rows[0].isActive,
    };

    if (updatedUser.rows[0].isAdmin) {
      filteredUser.isAdmin = true;
    }

    res.status(200).json(filteredUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Delete a user

router.delete("/:id", async (req, res) => {
  try {
    res.status(200).json("User was deleted.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
