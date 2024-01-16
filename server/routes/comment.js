const express = require("express");
const router = express.Router();
const pool = require("../db");

// Comments

// Get all comments

router.get("/", async (req, res) => {
  try {
    const comments = await pool.query("SELECT * FROM user_comments");
    res.status(200).json(comments.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all comments for a recipe

router.get("/recipe/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await pool.query(
      "SELECT * FROM user_comments WHERE recipe_id = $1",
      [id]
    );

    for (let comment of comments.rows) {
      let usernames = await pool.query(
        "SELECT username FROM users WHERE user_id = $1",
        [comment.user_id]
      );
      let username = usernames.rows[0].username;
      comment.username = username;
    }
    res.status(200).json(comments.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all comments for a user

router.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await pool.query(
      "SELECT * FROM user_comments WHERE user_id = $1",
      [id]
    );
    res.status(200).json(comments.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create comment

//Recipe ID
router.post("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, reply_to } = req.body;

    const recipe = await pool.query(
      "SELECT * FROM recipes WHERE recipe_id = $1",
      [id]
    );

    if (recipe.rows.length === 0) {
      return res.status(400).json({ msg: "Recipe does not exist." });
    }
    let newComment;
    if (!reply_to) {
      newComment = await pool.query(
        "INSERT INTO user_comments (user_id, recipe_id, comment) VALUES ($1, $2, $3) RETURNING *",
        [req.user.user_id, id, comment]
      );
    } else {
      newComment = await pool.query(
        "INSERT INTO user_comments (user_id, recipe_id, comment, reply_to) VALUES ($1, $2, $3, $4) RETURNING *",
        [req.user.user_id, id, comment, reply_to]
      );
    }

    res.status(200).json(newComment.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit comment
//Comment ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const recipe = await pool.query(
      "SELECT * FROM recipes WHERE recipe_id = $1",
      [id]
    );

    if (recipe.rows.length === 0) {
      return res.status(400).json({ msg: "Recipe does not exist." });
    }

    const oldComment = await pool.query(
      "SELECT * FROM user_comments WHERE user_id = $1 AND recipe_id = $2",
      [req.user.user_id, id]
    );

    if (oldComment.rows.length === 0) {
      return res.status(400).json({ msg: "Comment does not exist." });
    }

    const updated_at = new Date();

    const newComment = await pool.query(
      "UPDATE user_comments SET comment = $1, updated_at = $2 WHERE user_id = $3 AND recipe_id = $4 RETURNING *",
      [comment, updated_at, req.user.user_id, id]
    );

    res.status(200).json(newComment.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete comment

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const oldComment = await pool.query(
      "SELECT * FROM user_comments WHERE user_id = $1 AND recipe_id = $2",
      [req.user.user_id, id]
    );

    if (oldComment.rows.length === 0) {
      return res.status(400).json({ msg: "Comment does not exist." });
    }

    await pool.query(
      "DELETE FROM user_comments WHERE user_id = $1 AND recipe_id = $2",
      [req.user.user_id, id]
    );

    res.status(200).json("Comment was deleted.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
