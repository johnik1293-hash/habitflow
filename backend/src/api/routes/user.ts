import { Router } from "express";
import { sql } from "../../database/db.js";

export const userRouter = Router();

userRouter.get("/profile", async (req, res) => {
  const telegramId = Number(req.header("x-telegram-id"));
  if (!telegramId) {
    res.status(401).json({ error: "x-telegram-id header is required" });
    return;
  }

  let [user] = await sql`SELECT * FROM users WHERE telegram_id = ${telegramId}`;
  if (!user) {
    [user] = await sql`
      INSERT INTO users (telegram_id, username, first_name)
      VALUES (${telegramId}, NULL, NULL)
      RETURNING *
    `;
  }
  res.json(user);
});

userRouter.put("/profile", async (req, res) => {
  const telegramId = Number(req.header("x-telegram-id"));
  if (!telegramId) {
    res.status(401).json({ error: "x-telegram-id header is required" });
    return;
  }
  const { username, first_name, timezone } = req.body;

  const [user] = await sql`
    INSERT INTO users (telegram_id, username, first_name, timezone)
    VALUES (${telegramId}, ${username ?? null}, ${first_name ?? null}, ${timezone ?? "UTC"})
    ON CONFLICT (telegram_id) DO UPDATE
    SET username = COALESCE(EXCLUDED.username, users.username),
        first_name = COALESCE(EXCLUDED.first_name, users.first_name),
        timezone = COALESCE(EXCLUDED.timezone, users.timezone),
        updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  res.json(user);
});
