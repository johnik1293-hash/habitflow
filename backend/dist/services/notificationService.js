import { db } from "../database/db.js";
import { sendTelegramMessage } from "../utils/telegram.js";
import { getCurrentStreak } from "./streakService.js";
function buildNotificationText(habitTitle, streak) {
    if (streak >= 3) {
        return `Не разорви streak в ${streak} дней! ${habitTitle} 🔥`;
    }
    return `Время для "${habitTitle}"! 🌟`;
}
export async function processDueNotifications() {
    const due = db
        .prepare(`SELECT id, user_id, habit_id, scheduled_time
       FROM notifications
       WHERE is_sent = 0
       AND scheduled_time <= datetime('now')
       ORDER BY scheduled_time ASC
       LIMIT 100`)
        .all();
    for (const n of due) {
        try {
            const user = db.prepare("SELECT telegram_id FROM users WHERE id = ?").get(n.user_id);
            const habit = db.prepare("SELECT title FROM habits WHERE id = ?").get(n.habit_id);
            if (!user || !habit)
                continue;
            const streak = getCurrentStreak(n.user_id, n.habit_id);
            const text = buildNotificationText(habit.title, streak);
            await sendTelegramMessage(user.telegram_id, text);
            db.prepare("UPDATE notifications SET is_sent = 1, sent_at = CURRENT_TIMESTAMP WHERE id = ?").run(n.id);
        }
        catch (error) {
            console.error("Failed to process notification", n.id, error);
        }
    }
}
export function startNotificationWorker() {
    const enabled = process.env.ENABLE_NOTIFICATION_WORKER === "true";
    if (!enabled)
        return;
    setInterval(() => {
        processDueNotifications().catch((error) => {
            console.error("Notification worker loop failed", error);
        });
    }, 60 * 1000);
}
