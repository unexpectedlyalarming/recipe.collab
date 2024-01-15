const express = require("express");

const router = express.Router();

const pool = require("../db");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const rateLimit = require("express-rate-limit");

const secret_key = process.env.SECRET_KEY;

const registerLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 100, // change to 10
});

const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 150, //change to 15
});

router.post("/register", registerLimiter, async (req, res) => {
  try {
    const { username, password, email, first_name, last_name, bio } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required." });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    if (!first_name) {
      return res.status(400).json({ message: "First name is required." });
    }

    if (!last_name) {
      return res.status(400).json({ message: "Last name is required." });
    }

    const user = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (user.rows.length > 0) {
      return res.status(400).json({ message: "User already exists." });
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
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Not all fields have been entered." });
    }

    const user = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User does not exist." });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
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
    res.status(200).json({ message: "Logged out." });
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
