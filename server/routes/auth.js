const express = require("express");

const router = express.Router();

const pool = require("../db");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const secret_key = process.env.SECRET_KEY;

router.post("/register", async (req, res) => {
  try {
    const { username, password, email, first_name, last_name, bio } = req.body;

    switch (req.body) {
      case !username:
        return res.status(400).json({ msg: "Username is required." });

      case !password:
        return res.status(400).json({ msg: "Password is required." });

      case !email:
        return res.status(400).json({ msg: "Email is required." });

      case !first_name:
        return res.status(400).json({ msg: "First name is required." });

      case !last_name:
        return res.status(400).json({ msg: "Last name is required." });

      case !bio:
        return res.status(400).json({ msg: "Bio is required." });
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
      user_id: user.rows[0].user_id,
    };

    const token = jwt.sign(filteredUser, secret_key);

    res.cookie("accessToken", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 30,
    });

    req.user = filteredUser;

    res.status(200).json(filteredUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout

router.get("/logout", async (req, res) => {
  try {
    res.cookie("accessToken", "", { maxAge: 1, httpOnly: true });
    req.user = null;
    res.status(200).json({ msg: "Logged out." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check session

const verifyUser = require("../utils/authUtils");

router.get("/session", verifyUser, async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
