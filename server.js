import "dotenv/config";
import app from "./app.js";
import pool from "./config/db.js";
import { seedEventIfNotExists } from "./services/eventService.js";

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("Connected to Neon DB");

    await seedEventIfNotExists();

    app.listen(PORT, () => {
      console.log(`TicketBoss running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  }
})();
