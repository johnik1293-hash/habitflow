import { db } from "../database/db.js";
import { getCurrentStreak, getLongestStreak } from "./streakService.js";
export function getOverview(userId) {
    const total = db
        .prepare("SELECT COUNT(*) as value FROM habits WHERE user_id = ? AND is_active = 1")
        .get(userId);
    const completedWeek = db
        .prepare("SELECT COUNT(*) as value FROM habit_logs WHERE user_id = ? AND date >= date('now','-6 day')")
        .get(userId);
    const habits = db.prepare("SELECT id FROM habits WHERE user_id = ? AND is_active = 1").all(userId);
    const streaks = habits.map((h) => getCurrentStreak(userId, h.id));
    const longest = habits.reduce((acc, h) => Math.max(acc, getLongestStreak(userId, h.id)), 0);
    const possibleWeek = total.value * 7;
    const completionRate = possibleWeek ? Math.round((completedWeek.value / possibleWeek) * 100) : 0;
    return {
        total_habits: total.value,
        active_streaks: streaks.filter((s) => s > 0).length,
        completion_rate: completionRate,
        longest_streak: longest
    };
}
