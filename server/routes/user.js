const express = require("express");

const router = express.Router();

const pool = require("../db");

//Get all users

router.get("/", async (req, res) => {
  try {
    const allUsers = await pool.query("SELECT * FROM users");
    res.status(200).json(allUsers.rows);
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
    res.status(200).json(user.rows[0]);
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
