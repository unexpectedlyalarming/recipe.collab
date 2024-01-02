const express = require("express");

const router = express.Router();

const pool = require("../db");

const bcrypt = require("bcrypt");

router.post("/register", async (req, res) => {
  try {
    const { username, password, email, first_name, last_name, bio } = req.body;

    if (!username || !password || !email || !first_name || !last_name || !bio) {
      return res.status(400).json({ msg: "Not all fields have been entered." });
    }

    const user = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (user.rows.length > 0) {
      return res.status(400).json({ msg: "User already exists." });
    }

    const hash = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users (username, password, email, first_name, last_name, bio) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [username, hash, email, first_name, last_name, bio]
    );

    const filteredUser = {
      username: newUser.rows[0].username,
      email: newUser.rows[0].email,
      first_name: newUser.rows[0].first_name,
      last_name: newUser.rows[0].last_name,
      bio: newUser.rows[0].bio,
    };

    res.status(200).json(filteredUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ msg: "Not all fields have been entered." });
    }

    const user = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (user.rows.length === 0) {
      return res.status(400).json({ msg: "User does not exist." });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials." });
    }

    const filteredUser = {
      username: user.rows[0].username,
      email: user.rows[0].email,
      first_name: user.rows[0].first_name,
      last_name: user.rows[0].last_name,
      bio: user.rows[0].bio,
    };
    req.user = filteredUser;

    res.status(200).json(filteredUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
