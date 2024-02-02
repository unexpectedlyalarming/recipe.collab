const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const PrettyError = require("pretty-error");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const path = require("path");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

app.use(morgan("dev"));

const corsOrigin = process.env.CORS_ORIGIN || "*";

const sessionSecret = process.env.SESSION_SECRET || "secret";

const corsOptions = {
  origin: corsOrigin,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(cookieParser());

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
});

app.use(limiter);

const pe = new PrettyError();

pe.start();

//Routes

const verifyUser = require("./utils/authUtils");

const authRouter = require("./routes/auth");
app.use("/auth", authRouter);

const recipeRouter = require("./routes/recipe");
app.use("/recipe", verifyUser, recipeRouter);

const userRouter = require("./routes/user");
app.use("/user", verifyUser, userRouter);

const starRouter = require("./routes/star");
app.use("/star", verifyUser, starRouter);

const commentRouter = require("./routes/comment");
app.use("/comment", verifyUser, commentRouter);

const listRouter = require("./routes/list");
app.use("/list", verifyUser, listRouter);

const ratingRouter = require("./routes/rating");
app.use("/rating", verifyUser, ratingRouter);

const cartRouter = require("./routes/cart");
app.use("/cart", verifyUser, cartRouter);

const followerRouter = require("./routes/follower");
app.use("/follower", verifyUser, followerRouter);

// Files

function filesCors(req, res, next) {
  res.header("Access-Control-Allow-Origin", corsOrigin);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}

app.use(
  "/uploads",
  filesCors,
  express.static(path.join(__dirname, "public/uploads"))
);
//User Activity Scheduler

const scheduleUserActivityCheck = require("./utils/userActivityScheduler");

scheduleUserActivityCheck();

module.exports = app;
