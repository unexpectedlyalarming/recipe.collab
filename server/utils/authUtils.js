const jwt = require("jsonwebtoken");

const secret_key = process.env.SECRET_KEY;

async function verifyUser(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: "Unauthorized. Missing user." });
    }
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ msg: "Unauthorized. Missing token." });
    }

    const decoded = jwt.verify(token, secret_key);

    if (!decoded.id) {
      return res.status(401).json({ msg: "Unauthorized. Invalid token." });
    }

    req.user = decoded;

    const currentTime = Date.now() / 1000;

    if (decoded.exp - currentTime < 15) {
      const newToken = jwt.sign(decoded, secret_key, {
        expiresIn: "30m",
      });
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

module.exports = verifyUser;
