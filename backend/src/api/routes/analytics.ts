import { Router } from "express";
import { sql } from "../../database/db.js";
import { requireUserId } from "../utils.js";
import { getOverview } from "../../services/analyticsService.js";
import { getCurrentStreak, getLongestStreak } from "../../services/streakService.js";

export const analyticsRouter = Router();

analyticsRouter.get("/overview", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  res.json(await getOverview(userId));
});

analyticsRouter.get("/habits/:id", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const habitId = Number(req.params.id);

  const [habit] = await sql`SELECT * FROM habits WHERE id = ${habitId} AND user_id = ${userId}`;
  if (!habit) {
    res.status(404).json({ error: "Habit not found" });
    return;
  }

  const monthly = await sql`
    SELECT LEFT(date, 7) as month, COUNT(*) as completions
    FROM habit_logs WHERE habit_id = ${habitId} AND user_id = ${userId}
    GROUP BY LEFT(date, 7)
    ORDER BY month DESC
  `;

  res.json({
    habit,
    current_streak: await getCurrentStreak(userId, habitId),
    longest_streak: await getLongestStreak(userId, habitId),
    monthly,
  });
});

analyticsRouter.get("/calendar/:month", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const month = req.params.month;
  const rows = await sql`
    SELECT date, COUNT(*) as completions
    FROM habit_logs
    WHERE user_id = ${userId} AND date LIKE ${month + "%"}
    GROUP BY date
    ORDER BY date ASC
  `;
  res.json(rows);
});
