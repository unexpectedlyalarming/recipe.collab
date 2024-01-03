const Pool = require("pg").Pool;
const dotenv = require("dotenv");
const fs = require("fs");
const readlineSync = require("readline-sync");

dotenv.config();

const dbUser = process.env.DB_USER || "postgres";
const dbPassword = process.env.DB_PASSWORD || "";
const dbName = process.env.DB_NAME || "recipecollabdb";
const dbHost = process.env.DB_HOST || "localhost";

let env = process.env.ENV_TYPE || "dev";

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

async function initializeDB() {
  try {
    const initScript = fs.readFileSync("./database.sql", "utf-8");
    const client = await pool.connect();

    if (env === "dev") {
      // Drop all tables if they exist
      //Ask for confirmation

      const confirm = readlineSync.question(
        "WARNING: This will delete all data in the database and is UNRECOVERABLE. \nAre you sure you want to drop all tables (You are in development mode)? (y/n):"
      );
      if (confirm.toLowerCase() === "yes" || confirm.toLowerCase() === "y") {
        await client.query("DROP TABLE IF EXISTS recipe_versions");
        await client.query("DROP TABLE IF EXISTS instructions");
        await client.query("DROP TABLE IF EXISTS ingredients");
        await client.query("DROP TABLE IF EXISTS user_comments");
        await client.query("DROP TABLE IF EXISTS user_stars");
        await client.query("DROP TABLE IF EXISTS recipes");
        await client.query("DROP TABLE IF EXISTS user_follows");
        await client.query("DROP TABLE IF EXISTS users");
      }
    }

    await client.query(initScript);
    client.release();

    console.log("Database initialized");
  } catch (error) {
    console.error(error);
  }
}

initializeDB();
