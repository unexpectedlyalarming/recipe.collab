const pool = require("../db");
const cron = require("node-cron");

function scheduleUserActivityCheck() {
  cron.schedule("* * * * *", async () => {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      const users = await pool.query(
        `SELECT user_id FROM users WHERE last_active < $1 AND is_active = true`,
        [fiveMinutesAgo]
      );

      for (let user of users.rows) {
        await pool.query(
          `UPDATE users SET is_active = false WHERE user_id = $1 RETURNING is_active`,
          [user.user_id]
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  });
}

module.exports = scheduleUserActivityCheck;
