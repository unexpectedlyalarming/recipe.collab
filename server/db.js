const Pool = require("pg").Pool;
const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config();

const dbUser = process.env.DB_USER || "postgres";
const dbPassword = process.env.DB_PASSWORD || "";
const dbName = process.env.DB_NAME || "recipecollabdb";
const dbHost = process.env.DB_HOST || "localhost";
const env = process.env.ENV_TYPE || "dev";

if (env === "dev") {
  console.log("Using dev database");

  const pool = new Pool({
    user: dbUser,
    host: "localhost",
    port: 5432,
    database: dbName,
  });
}

if (env === "production") {
  console.log("Using production database");
  const pool = new Pool({
    user: dbUser,
    host: dbHost,
    password: dbPassword,
    port: 5432,
    database: dbName,
  });
}

module.exports = pool;
