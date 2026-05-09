import { Router } from "express";
import { sql } from "../../database/db";
import { requireUserId, todayDate } from "../utils";

export const loggingRouter = Router();

loggingRouter.post("/:id/log", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const habitId = Number(req.params.id);
  const { notes } = req.body;
  const date = todayDate();

  const [row] = await sql`
    INSERT INTO habit_logs (habit_id, user_id, date, notes)
    VALUES (${habitId}, ${userId}, ${date}, ${notes ?? null})
    ON CONFLICT (habit_id, date) DO UPDATE
    SET notes = EXCLUDED.notes, completed_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  res.status(201).json(row);
});

loggingRouter.delete("/:id/log", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const habitId = Number(req.params.id);
  const date = todayDate();
  await sql`
    DELETE FROM habit_logs WHERE habit_id = ${habitId} AND user_id = ${userId} AND date = ${date}
  `;
  res.status(204).send();
});

loggingRouter.get("/:id/logs", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const habitId = Number(req.params.id);
  const rows = await sql`
    SELECT * FROM habit_logs WHERE habit_id = ${habitId} AND user_id = ${userId} ORDER BY date DESC
  `;
  res.json(rows);
});
