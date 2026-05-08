import { Router } from "express";
import { db } from "../../database/db.js";
import { requireUserId, todayDate } from "../utils.js";
export const loggingRouter = Router();
loggingRouter.post("/:id/log", (req, res) => {
    const userId = requireUserId(req, res);
    if (!userId)
        return;
    const habitId = Number(req.params.id);
    const { notes } = req.body;
    const date = todayDate();
    db.prepare(`INSERT INTO habit_logs (habit_id, user_id, date, notes)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(habit_id, date) DO UPDATE SET notes = excluded.notes, completed_at = CURRENT_TIMESTAMP`).run(habitId, userId, date, notes ?? null);
    const row = db
        .prepare("SELECT * FROM habit_logs WHERE habit_id = ? AND user_id = ? AND date = ?")
        .get(habitId, userId, date);
    res.status(201).json(row);
});
loggingRouter.delete("/:id/log", (req, res) => {
    const userId = requireUserId(req, res);
    if (!userId)
        return;
    const habitId = Number(req.params.id);
    const date = todayDate();
    db.prepare("DELETE FROM habit_logs WHERE habit_id = ? AND user_id = ? AND date = ?").run(habitId, userId, date);
    res.status(204).send();
});
loggingRouter.get("/:id/logs", (req, res) => {
    const userId = requireUserId(req, res);
    if (!userId)
        return;
    const habitId = Number(req.params.id);
    const rows = db
        .prepare("SELECT * FROM habit_logs WHERE habit_id = ? AND user_id = ? ORDER BY date DESC")
        .all(habitId, userId);
    res.json(rows);
});
