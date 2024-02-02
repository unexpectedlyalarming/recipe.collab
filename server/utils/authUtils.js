const jwt = require("jsonwebtoken");
const pool = require("../db");

const secret_key = process.env.SECRET_KEY;

async function verifyUser(req, res, next) {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ msg: "Unauthorized. Missing token." });
    }

    const decoded = jwt.verify(token, secret_key);

    if (!decoded.user_id) {
      return res.status(402).json({ msg: "Unauthorized. Invalid token." });
    }

    req.user = decoded;

    await updateUserActivity(decoded.user_id);

    const currentTime = Date.now() / 1000;

    if (decoded.exp - currentTime < 120) {
      const newToken = jwt.sign(decoded, secret_key);
      res.cookie("accessToken", newToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 30,
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateUserActivity(userId) {
  try {
    const currentTime = new Date();
    const last_active = await pool.query(
      `UPDATE users SET last_active = $1 WHERE user_id = $2 RETURNING last_active`,
      [currentTime, userId]
    );
    const is_active = await pool.query(
      `UPDATE users SET is_active = true WHERE user_id = $1 RETURNING is_active`,
      [userId]
    );
    return "Successfully updated user activity.";
  } catch (error) {
    return new Error(error.message);
  }
}

module.exports = verifyUser;
