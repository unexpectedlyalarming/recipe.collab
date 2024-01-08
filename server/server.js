const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const PrettyError = require("pretty-error");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const session = require("express-session");
require("dotenv").config();

app.use(morgan("dev"));

const corsOrigin = process.env.CORS_ORIGIN || "*";

const port = process.env.PORT || 3000;

const sessionSecret = process.env.SESSION_SECRET || "secret";

const corsOptions = {
  origin: corsOrigin,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(cookieParser());

app.use(helmet());

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
  })
);

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

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

module.exports = app;
