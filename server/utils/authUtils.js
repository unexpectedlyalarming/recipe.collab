async function verifyUser(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: "Unauthorized. Missing user." });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = verifyUser;
