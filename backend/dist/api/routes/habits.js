import { Router } from "express";
import { db } from "../../database/db.js";
import { requireUserId, todayDate } from "../utils.js";
export const habitsRouter = Router();
habitsRouter.get("/", (req, res) => {
    const userId = requireUserId(req, res);
    if (!userId)
        return;
    const rows = db
        .prepare("SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC")
        .all(userId);
    res.json(rows);
});
habitsRouter.post("/", (req, res) => {
    const { title, emoji = "⭐", reminder_time = null } = req.body;
    const userId = requireUserId(req, res);
    if (!userId)
        return;
    if (!title) {
        res.status(400).json({ error: "title is required" });
        return;
    }
    const stmt = db.prepare("INSERT INTO habits (user_id, title, emoji, reminder_time) VALUES (?, ?, ?, ?)");
    const result = stmt.run(userId, title, emoji, reminder_time);
    const habit = db.prepare("SELECT * FROM habits WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(habit);
});
habitsRouter.put("/:id", (req, res) => {
    const userId = requireUserId(req, res);
    if (!userId)
        return;
    const id = Number(req.params.id);
    const { title, description, emoji, target_frequency, reminder_time, is_active } = req.body;
    const exists = db
        .prepare("SELECT id FROM habits WHERE id = ? AND user_id = ?")
        .get(id, userId);
    if (!exists) {
        res.status(404).json({ error: "Habit not found" });
        return;
    }
    db.prepare(`UPDATE habits
     SET title = COALESCE(?, title),
         description = COALESCE(?, description),
         emoji = COALESCE(?, emoji),
         target_frequency = COALESCE(?, target_frequency),
         reminder_time = COALESCE(?, reminder_time),
         is_active = COALESCE(?, is_active),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND user_id = ?`).run(title, description, emoji, target_frequency, reminder_time, is_active, id, userId);
    const updated = db.prepare("SELECT * FROM habits WHERE id = ?").get(id);
    res.json(updated);
});
habitsRouter.delete("/:id", (req, res) => {
    const userId = requireUserId(req, res);
    if (!userId)
        return;
    const id = Number(req.params.id);
    const result = db.prepare("DELETE FROM habits WHERE id = ? AND user_id = ?").run(id, userId);
    if (!result.changes) {
        res.status(404).json({ error: "Habit not found" });
        return;
    }
    res.status(204).send();
});
habitsRouter.get("/:id/streak", (req, res) => {
    const userId = requireUserId(req, res);
    if (!userId)
        return;
    const id = Number(req.params.id);
    const logs = db
        .prepare("SELECT date FROM habit_logs WHERE habit_id = ? AND user_id = ? ORDER BY date DESC LIMIT 365")
        .all(id, userId);
    const dates = new Set(logs.map((row) => row.date));
    let streak = 0;
    const cursor = new Date(todayDate());
    for (let i = 0; i < 365; i += 1) {
        const key = cursor.toISOString().slice(0, 10);
        if (dates.has(key)) {
            streak += 1;
            cursor.setDate(cursor.getDate() - 1);
            continue;
        }
        break;
    }
    res.json({ habit_id: id, current_streak: streak });
});
