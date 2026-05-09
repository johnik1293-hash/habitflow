import { Router } from "express";
import { sql } from "../../database/db.js";
import { requireUserId, todayDate } from "../utils.js";

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
  const { title, emoji = "⭐", reminder_time = null } = req.body;
  const userId = requireUserId(req, res);
  if (!userId) return;

  if (!title) {
    res.status(400).json({ error: "title is required" });
    return;
  }

  const [habit] = await sql`
    INSERT INTO habits (user_id, title, emoji, reminder_time)
    VALUES (${userId}, ${title}, ${emoji}, ${reminder_time})
    RETURNING *
  `;
  res.status(201).json(habit);
});

habitsRouter.put("/:id", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const id = Number(req.params.id);
  const { title, description, emoji, target_frequency, reminder_time, is_active } = req.body;

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
        is_active = COALESCE(${is_active ?? null}, is_active),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
  `;
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
