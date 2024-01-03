const Pool = require("pg").Pool;
const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config();

const dbUser = process.env.DB_USER || "postgres";
const dbPassword = process.env.DB_PASSWORD || "";
const dbName = process.env.DB_NAME || "recipecollabdb";

const pool = new Pool({
  user: dbUser,
  host: "localhost",
  port: 5432,
  database: dbName,
});

module.exports = pool;
