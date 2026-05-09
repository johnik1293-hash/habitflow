import { Router } from "express";
import { sql } from "../../database/db";
import { requireUserId, todayDate } from "../utils";
import { cancelHabitNotifications, scheduleHabitNotification } from "../../services/notificationService";

export const habitsRouter = Router();

habitsRouter.get("/", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const rows = await sql`
    SELECT * FROM habits WHERE user_id = ${userId} ORDER BY created_at DESC
  `;
  res.json(rows);
});

habitsRouter.post("/", async (req, res) => {
  const { title, emoji = "⭐", reminder_time = null, reminder_interval = null, reminder_end = null } = req.body;
  const userId = requireUserId(req, res);
  if (!userId) return;

  if (!title) {
    res.status(400).json({ error: "title is required" });
    return;
  }

  const [user] = await sql`
    SELECT subscription_tier, subscription_expires_at FROM users WHERE id = ${userId}
  `;
  const isPremium =
    user?.subscription_tier === "premium" &&
    (!user.subscription_expires_at || new Date(user.subscription_expires_at) > new Date());

  if (!isPremium) {
    const [{ count }] = await sql`
      SELECT COUNT(*) as count FROM habits WHERE user_id = ${userId} AND is_active = TRUE
    `;
    if (Number(count) >= 2) {
      res.status(403).json({
        error: "free_limit_reached",
        message: "На бесплатном плане можно добавить не более 2 привычек. Оформи Premium, чтобы добавить больше."
      });
      return;
    }
  }

  const [habit] = await sql`
    INSERT INTO habits (user_id, title, emoji, reminder_time, reminder_interval, reminder_end)
    VALUES (${userId}, ${title}, ${emoji}, ${reminder_time}, ${reminder_interval}, ${reminder_end})
    RETURNING *
  `;

  if (reminder_time) {
    await scheduleHabitNotification(userId, habit.id, reminder_time, reminder_interval, reminder_end);
  }

  res.status(201).json(habit);
});

habitsRouter.put("/:id", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const id = Number(req.params.id);
  const { title, description, emoji, target_frequency, reminder_time, reminder_interval, reminder_end, is_active } = req.body;

  const [exists] = await sql`
    SELECT id FROM habits WHERE id = ${id} AND user_id = ${userId}
  `;
  if (!exists) {
    res.status(404).json({ error: "Habit not found" });
    return;
  }

  const [updated] = await sql`
    UPDATE habits
    SET title = COALESCE(${title ?? null}, title),
        description = COALESCE(${description ?? null}, description),
        emoji = COALESCE(${emoji ?? null}, emoji),
        target_frequency = COALESCE(${target_frequency ?? null}, target_frequency),
        reminder_time = COALESCE(${reminder_time ?? null}, reminder_time),
        reminder_interval = ${reminder_interval !== undefined ? reminder_interval : sql`reminder_interval`},
        reminder_end = ${reminder_end !== undefined ? reminder_end : sql`reminder_end`},
        is_active = COALESCE(${is_active ?? null}, is_active),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
  `;

  if (reminder_time !== undefined || reminder_interval !== undefined || reminder_end !== undefined) {
    const rt = updated.reminder_time;
    if (rt) {
      await scheduleHabitNotification(userId, id, rt, updated.reminder_interval, updated.reminder_end);
    } else {
      await cancelHabitNotifications(userId, id);
    }
  }

  res.json(updated);
});

habitsRouter.delete("/:id", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const id = Number(req.params.id);

  const [deleted] = await sql`
    DELETE FROM habits WHERE id = ${id} AND user_id = ${userId} RETURNING id
  `;
  if (!deleted) {
    res.status(404).json({ error: "Habit not found" });
    return;
  }
  res.status(204).send();
});

habitsRouter.get("/:id/streak", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const id = Number(req.params.id);

  const logs = await sql`
    SELECT date FROM habit_logs
    WHERE habit_id = ${id} AND user_id = ${userId}
    ORDER BY date DESC LIMIT 365
  ` as Array<{ date: string }>;

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
