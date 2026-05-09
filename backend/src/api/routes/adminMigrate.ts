import { Router } from "express";
import { sql } from "../../database/db";

export const adminMigrateRouter = Router();

adminMigrateRouter.post("/run", async (req, res) => {
  const secret = req.headers["x-admin-secret"];
  if (!secret || secret !== process.env.ADMIN_MIGRATE_SECRET) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  try {
    await sql`
      ALTER TABLE habits
        ADD COLUMN IF NOT EXISTS reminder_interval INTEGER,
        ADD COLUMN IF NOT EXISTS reminder_end TEXT
    `;
    res.json({ ok: true, message: "003_reminder_interval applied" });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error) });
  }
});
