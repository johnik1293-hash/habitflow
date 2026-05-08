import { Router } from "express";
import { db } from "../../database/db.js";
import { requireUserId } from "../utils.js";
import { getOverview } from "../../services/analyticsService.js";
import { getCurrentStreak, getLongestStreak } from "../../services/streakService.js";
export const analyticsRouter = Router();
analyticsRouter.get("/overview", (req, res) => {
    const userId = requireUserId(req, res);
    if (!userId)
        return;
    res.json(getOverview(userId));
});
analyticsRouter.get("/habits/:id", (req, res) => {
    const userId = requireUserId(req, res);
    if (!userId)
        return;
    const habitId = Number(req.params.id);
    const habit = db.prepare("SELECT * FROM habits WHERE id = ? AND user_id = ?").get(habitId, userId);
    if (!habit) {
        res.status(404).json({ error: "Habit not found" });
        return;
    }
    const monthly = db
        .prepare(`SELECT substr(date, 1, 7) as month, COUNT(*) as completions
       FROM habit_logs WHERE habit_id = ? AND user_id = ?
       GROUP BY substr(date, 1, 7)
       ORDER BY month DESC`)
        .all(habitId, userId);
    res.json({
        habit,
        current_streak: getCurrentStreak(userId, habitId),
        longest_streak: getLongestStreak(userId, habitId),
        monthly
    });
});
analyticsRouter.get("/calendar/:month", (req, res) => {
    const userId = requireUserId(req, res);
    if (!userId)
        return;
    const month = req.params.month;
    const rows = db
        .prepare(`SELECT date, COUNT(*) as completions
       FROM habit_logs
       WHERE user_id = ? AND date LIKE ?
       GROUP BY date
       ORDER BY date ASC`)
        .all(userId, `${month}%`);
    res.json(rows);
});
