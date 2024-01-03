const Pool = require("pg").Pool;
const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config();

const dbUser = process.env.DB_USER || "postgres";
const dbPassword = process.env.DB_PASSWORD || "";
const dbName = process.env.DB_NAME || "recipecollabdb";
const dbHost = process.env.DB_HOST || "localhost";
const env = process.env.ENV_TYPE || "dev";

let poolOptions;

if (env === "dev") {
  console.log("Using dev environment");

  poolOptions = {
    user: dbUser,
    host: dbHost,
    port: 5432,
    database: dbName,
  };
}

if (env === "production") {
  console.log("Using production environment");
  poolOptions = {
    user: dbUser,
    host: dbHost,
    port: 5432,
    database: dbName,
    password: dbPassword,
  };
}
const pool = new Pool(poolOptions);

module.exports = pool;
