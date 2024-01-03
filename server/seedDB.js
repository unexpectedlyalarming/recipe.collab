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
