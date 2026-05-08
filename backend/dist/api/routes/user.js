import { Router } from "express";
import { db } from "../../database/db.js";
export const userRouter = Router();
userRouter.get("/profile", (req, res) => {
    const telegramId = Number(req.header("x-telegram-id"));
    if (!telegramId) {
        res.status(401).json({ error: "x-telegram-id header is required" });
        return;
    }
    let user = db.prepare("SELECT * FROM users WHERE telegram_id = ?").get(telegramId);
    if (!user) {
        const insert = db
            .prepare("INSERT INTO users (telegram_id, username, first_name) VALUES (?, ?, ?)")
            .run(telegramId, null, null);
        user = db.prepare("SELECT * FROM users WHERE id = ?").get(insert.lastInsertRowid);
    }
    res.json(user);
});
userRouter.put("/profile", (req, res) => {
    const telegramId = Number(req.header("x-telegram-id"));
    if (!telegramId) {
        res.status(401).json({ error: "x-telegram-id header is required" });
        return;
    }
    const { username, first_name, timezone } = req.body;
    const existing = db.prepare("SELECT id FROM users WHERE telegram_id = ?").get(telegramId);
    if (!existing) {
        db.prepare("INSERT INTO users (telegram_id, username, first_name, timezone) VALUES (?, ?, ?, ?)")
            .run(telegramId, username ?? null, first_name ?? null, timezone ?? "UTC");
    }
    db.prepare(`UPDATE users
     SET username = COALESCE(?, username),
         first_name = COALESCE(?, first_name),
         timezone = COALESCE(?, timezone),
         updated_at = CURRENT_TIMESTAMP
     WHERE telegram_id = ?`).run(username, first_name, timezone, telegramId);
    const user = db.prepare("SELECT * FROM users WHERE telegram_id = ?").get(telegramId);
    res.json(user);
});
