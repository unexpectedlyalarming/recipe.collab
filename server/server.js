const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");

app.use(morgan("dev"));

app.use(cors());

app.use(express.json());

//Routes

const authRouter = require("./routes/auth");

app.use("/auth", authRouter);

app.listen(3000, () => {
  console.log("server started");
});
