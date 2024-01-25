const express = require("express");

const router = express.Router();

const pool = require("../db");

// Upsert to follow/unfollow a user

router.put("/:followingId", async (req, res) => {
  try {
    const { followingId } = req.params;
    const userId = req.user.user_id;

    const follow = await pool.query(
      "SELECT * FROM user_follows WHERE user_id = $1 AND follower_id = $2",
      [followingId, userId]
    );

    if (follow.rows.length > 0) {
      const unfollow = await pool.query(
        "DELETE FROM user_follows WHERE user_id = $1 AND follower_id = $2",
        [followingId, userId]
      );
      return res.status(200).json(false);
    }

    const newFollow = await pool.query(
      "INSERT INTO user_follows (user_id, follower_id) VALUES ($1, $2) RETURNING *",
      [followingId, userId]
    );

    return res.status(200).json(true);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Yeah, I get separation of concerns, but
// I'm going to just include followers in the user route
// To save on queries.

module.exports = router;
