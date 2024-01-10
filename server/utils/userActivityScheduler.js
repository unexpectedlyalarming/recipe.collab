const db = require("./db");
const cron = require("node-cron");

function scheduleUserActivityCheck() {
  cron.schedule("* * * * *", async () => {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      const users = await db.query(
        `SELECT id FROM users WHERE last_active < $1 AND is_active = true`,
        [fiveMinutesAgo]
      );

      for (let user of users.rows) {
        await db.query(
          `UPDATE users SET is_active = false WHERE id = $1 RETURNING is_active`,
          [user.id]
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  });
}

module.exports = scheduleUserActivityCheck;
