import { sql } from "../database/db";
import { getCurrentStreak, getLongestStreak } from "./streakService";

export async function getOverview(userId: number) {
  const [total] = await sql`
    SELECT COUNT(*) as value FROM habits WHERE user_id = ${userId} AND is_active = TRUE
  ` as Array<{ value: string }>;

  const [completedWeek] = await sql`
    SELECT COUNT(*) as value FROM habit_logs
    WHERE user_id = ${userId}
      AND date >= to_char(CURRENT_DATE - INTERVAL '6 days', 'YYYY-MM-DD')
  ` as Array<{ value: string }>;

  const habits = await sql`
    SELECT id FROM habits WHERE user_id = ${userId} AND is_active = TRUE
  ` as Array<{ id: number }>;

  const streaks = await Promise.all(habits.map((h) => getCurrentStreak(userId, h.id)));
  const longest = (await Promise.all(habits.map((h) => getLongestStreak(userId, h.id)))).reduce(
    (acc, s) => Math.max(acc, s),
    0
  );

  const totalCount = Number(total.value);
  const completedCount = Number(completedWeek.value);
  const possibleWeek = totalCount * 7;
  const completionRate = possibleWeek ? Math.round((completedCount / possibleWeek) * 100) : 0;

  return {
    total_habits: totalCount,
    active_streaks: streaks.filter((s) => s > 0).length,
    completion_rate: completionRate,
    longest_streak: longest,
  };
}
