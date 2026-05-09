import { sql } from "../database/db";
import { sendTelegramMessage } from "../utils/telegram";
import { getCurrentStreak } from "./streakService";

type NotificationRow = {
  id: number;
  user_id: number;
  habit_id: number;
  scheduled_time: string;
};

type HabitRow = {
  title: string;
  emoji: string;
  reminder_time: string | null;
  reminder_interval: number | null;
  reminder_end: string | null;
};

function buildNotificationText(title: string, emoji: string, streak: number): string {
  if (streak >= 7) return `${emoji} Невероятно! Стрик ${streak} дней — не останавливайся! 🔥`;
  if (streak >= 3) return `${emoji} Стрик ${streak} дней — не разрывай цепочку! 💪`;
  return `${emoji} Время для "${title}"! Не забудь отметить сегодня 🌟`;
}

// Следующее время в цепочке повторений
function nextOccurrence(fromTime: Date, habit: Pick<HabitRow, "reminder_time" | "reminder_interval" | "reminder_end">): Date {
  const interval = habit.reminder_interval!;
  const endStr = habit.reminder_end ?? "22:00";

  const next = new Date(fromTime);
  next.setMinutes(next.getMinutes() + interval, 0, 0);

  const [endH, endM] = endStr.split(":").map(Number);
  const endToday = new Date(next);
  endToday.setHours(endH, endM, 0, 0);

  if (next > endToday) {
    // Переходим на завтра — начало окна
    const [startH, startM] = habit.reminder_time!.split(":").map(Number);
    const tomorrow = new Date(next);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(startH, startM, 0, 0);
    return tomorrow;
  }
  return next;
}

export async function scheduleHabitNotification(
  userId: number,
  habitId: number,
  reminderTime: string,
  reminderInterval?: number | null,
  reminderEnd?: string | null
): Promise<void> {
  await sql`DELETE FROM notifications WHERE habit_id = ${habitId} AND user_id = ${userId} AND is_sent = FALSE`;

  const now = new Date();

  if (!reminderInterval) {
    // Один раз в день
    const [h, m] = reminderTime.split(":").map(Number);
    const next = new Date();
    next.setHours(h, m, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    await sql`INSERT INTO notifications (user_id, habit_id, scheduled_time, is_sent) VALUES (${userId}, ${habitId}, ${next.toISOString()}, FALSE)`;
  } else {
    // Повторяющиеся — планируем первое вхождение начиная с сейчас
    const endStr = reminderEnd ?? "22:00";
    const [startH, startM] = reminderTime.split(":").map(Number);
    const [endH, endM] = endStr.split(":").map(Number);

    const cursor = new Date();
    cursor.setHours(startH, startM, 0, 0);

    // Если начало уже прошло — найти следующее вхождение сегодня
    while (cursor <= now) {
      cursor.setMinutes(cursor.getMinutes() + reminderInterval);
    }

    // Если вышли за конец окна — перенести на завтра
    const endToday = new Date();
    endToday.setHours(endH, endM, 0, 0);
    if (cursor > endToday) {
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(startH, startM, 0, 0);
    }

    await sql`INSERT INTO notifications (user_id, habit_id, scheduled_time, is_sent) VALUES (${userId}, ${habitId}, ${cursor.toISOString()}, FALSE)`;
  }
}

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
      const [habit] = await sql`
        SELECT title, emoji, reminder_time, reminder_interval, reminder_end FROM habits WHERE id = ${n.habit_id}
      ` as HabitRow[];
      if (!user || !habit) continue;

      const streak = await getCurrentStreak(n.user_id, n.habit_id);
      await sendTelegramMessage(user.telegram_id, buildNotificationText(habit.title, habit.emoji, streak));
      await sql`UPDATE notifications SET is_sent = TRUE, sent_at = NOW() WHERE id = ${n.id}`;

      // Планируем следующее
      if (habit.reminder_time) {
        let nextTime: Date;
        if (habit.reminder_interval) {
          nextTime = nextOccurrence(new Date(n.scheduled_time), habit);
        } else {
          nextTime = new Date(n.scheduled_time);
          nextTime.setDate(nextTime.getDate() + 1);
        }
        await sql`INSERT INTO notifications (user_id, habit_id, scheduled_time, is_sent) VALUES (${n.user_id}, ${n.habit_id}, ${nextTime.toISOString()}, FALSE)`;
      }
    } catch (error) {
      console.error("Failed to process notification", n.id, error);
    }
  }
}
