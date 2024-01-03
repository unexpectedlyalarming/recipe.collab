const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const PrettyError = require("pretty-error");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

app.use(morgan("dev"));

const corsOrigin = process.env.CORS_ORIGIN || "*";

const port = process.env.PORT || 3000;

const corsOptions = {
  origin: corsOrigin,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(cookieParser());

app.use(helmet());

const pe = new PrettyError();

pe.start();

//Routes

const authRouter = require("./routes/auth");
app.use("/auth", authRouter);

const recipeRouter = require("./routes/recipe");
app.use("/recipe", recipeRouter);

const userRouter = require("./routes/user");
app.use("/user", userRouter);

const starRouter = require("./routes/star");
app.use("/star", starRouter);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
