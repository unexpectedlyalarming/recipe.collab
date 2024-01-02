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

async function initializeDB() {
  try {
    const initScript = fs.readFileSync("./database.sql", "utf-8");
    const client = await pool.connect();
    await client.query(initScript);
    client.release();

    console.log("Database initialized");
  } catch (error) {
    console.error(error);
  }
}

// initializeDB();

module.exports = pool;
