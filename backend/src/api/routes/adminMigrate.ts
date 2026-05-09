import { Router } from "express";
import { sql } from "../../database/db";
import { scheduleHabitNotification } from "../../services/notificationService";

export const adminMigrateRouter = Router();

// Планирует уведомления для всех привычек у которых задано reminder_time, но нет pending уведомлений
adminMigrateRouter.post("/schedule-reminders", async (req, res) => {
  const secret = req.headers["x-admin-secret"];
  if (!secret || secret !== process.env.ADMIN_MIGRATE_SECRET) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const habits = await sql`
    SELECT h.id, h.user_id, h.reminder_time
    FROM habits h
    WHERE h.reminder_time IS NOT NULL
      AND h.is_active = TRUE
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.habit_id = h.id AND n.is_sent = FALSE
      )
  ` as Array<{ id: number; user_id: number; reminder_time: string }>;

  for (const habit of habits) {
    await scheduleHabitNotification(habit.user_id, habit.id, habit.reminder_time);
  }

  res.json({ ok: true, scheduled: habits.length });
});
