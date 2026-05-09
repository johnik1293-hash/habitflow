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
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'free',
        ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP
    `;
    res.json({ ok: true, message: "Migration 002_subscription applied" });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error) });
  }
});
