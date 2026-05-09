import { sql } from "../database/db";
import { sendTelegramMessage } from "../utils/telegram";
import { getCurrentStreak } from "./streakService";

type NotificationRow = {
  id: number;
  user_id: number;
  habit_id: number;
  scheduled_time: string;
};

function buildNotificationText(habitTitle: string, emoji: string, streak: number): string {
  if (streak >= 7) return `${emoji} Невероятно! Стрик ${streak} дней — не останавливайся! 🔥`;
  if (streak >= 3) return `${emoji} Стрик ${streak} дней — не разрывай цепочку! 💪`;
  return `${emoji} Время для "${habitTitle}"! Не забудь отметить сегодня 🌟`;
}

// Планирует следующее уведомление для привычки на основе reminder_time ("HH:MM")
export async function scheduleHabitNotification(
  userId: number,
  habitId: number,
  reminderTime: string
): Promise<void> {
  const [hours, minutes] = reminderTime.split(":").map(Number);

  const next = new Date();
  next.setHours(hours, minutes, 0, 0);
  // Если время на сегодня уже прошло — ставим на завтра
  if (next <= new Date()) {
    next.setDate(next.getDate() + 1);
  }

  // Удаляем старое неотправленное уведомление и добавляем новое
  await sql`DELETE FROM notifications WHERE habit_id = ${habitId} AND user_id = ${userId} AND is_sent = FALSE`;
  await sql`
    INSERT INTO notifications (user_id, habit_id, scheduled_time, is_sent)
    VALUES (${userId}, ${habitId}, ${next.toISOString()}, FALSE)
  `;
}

// Снимает все запланированные уведомления привычки
export async function cancelHabitNotifications(userId: number, habitId: number): Promise<void> {
  await sql`DELETE FROM notifications WHERE habit_id = ${habitId} AND user_id = ${userId} AND is_sent = FALSE`;
}

export async function processDueNotifications(): Promise<void> {
  const due = await sql`
    SELECT n.id, n.user_id, n.habit_id, n.scheduled_time
    FROM notifications n
    JOIN habits h ON h.id = n.habit_id AND h.is_active = TRUE
    WHERE n.is_sent = FALSE AND n.scheduled_time <= NOW()
    ORDER BY n.scheduled_time ASC
    LIMIT 100
  ` as NotificationRow[];

  for (const n of due) {
    try {
      const [user] = await sql`SELECT telegram_id FROM users WHERE id = ${n.user_id}` as Array<{ telegram_id: number }>;
      const [habit] = await sql`SELECT title, emoji, reminder_time FROM habits WHERE id = ${n.habit_id}` as Array<{ title: string; emoji: string; reminder_time: string | null }>;
      if (!user || !habit) continue;

      const streak = await getCurrentStreak(n.user_id, n.habit_id);
      const text = buildNotificationText(habit.title, habit.emoji, streak);
      await sendTelegramMessage(user.telegram_id, text);

      await sql`UPDATE notifications SET is_sent = TRUE, sent_at = NOW() WHERE id = ${n.id}`;

      // Планируем следующее уведомление на завтра
      if (habit.reminder_time) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [hours, minutes] = habit.reminder_time.split(":").map(Number);
        tomorrow.setHours(hours, minutes, 0, 0);

        await sql`
          INSERT INTO notifications (user_id, habit_id, scheduled_time, is_sent)
          VALUES (${n.user_id}, ${n.habit_id}, ${tomorrow.toISOString()}, FALSE)
        `;
      }
    } catch (error) {
      console.error("Failed to process notification", n.id, error);
    }
  }
}
