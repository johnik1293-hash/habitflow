import { sql } from "../database/db.js";
import { sendTelegramMessage } from "../utils/telegram.js";
import { getCurrentStreak } from "./streakService.js";

type NotificationRow = {
  id: number;
  user_id: number;
  habit_id: number;
  scheduled_time: string;
};

function buildNotificationText(habitTitle: string, streak: number): string {
  if (streak >= 3) {
    return `Не разорви streak в ${streak} дней! ${habitTitle} 🔥`;
  }
  return `Время для "${habitTitle}"! 🌟`;
}

export async function processDueNotifications(): Promise<void> {
  const due = await sql`
    SELECT id, user_id, habit_id, scheduled_time
    FROM notifications
    WHERE is_sent = FALSE AND scheduled_time <= NOW()
    ORDER BY scheduled_time ASC
    LIMIT 100
  ` as NotificationRow[];

  for (const n of due) {
    try {
      const [user] = await sql`SELECT telegram_id FROM users WHERE id = ${n.user_id}` as Array<{ telegram_id: number }>;
      const [habit] = await sql`SELECT title FROM habits WHERE id = ${n.habit_id}` as Array<{ title: string }>;
      if (!user || !habit) continue;

      const streak = await getCurrentStreak(n.user_id, n.habit_id);
      const text = buildNotificationText(habit.title, streak);
      await sendTelegramMessage(user.telegram_id, text);

      await sql`UPDATE notifications SET is_sent = TRUE, sent_at = NOW() WHERE id = ${n.id}`;
    } catch (error) {
      console.error("Failed to process notification", n.id, error);
    }
  }
}
