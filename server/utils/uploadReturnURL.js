const upload = require("./multerConfig");

function uploadReturnURL(req, res, next) {
  upload.single("image")(req, res, function (err) {
    if (err) {
      return next(err);
    }
    if (req.file) {
      req.fileUrl =
        req.protocol +
        "://" +
        req.get("host") +
        "/uploads/" +
        req.file.filename;
    } else {
      req.fileUrl = null;
    }

    next();
  });
}

module.exports = uploadReturnURL;
