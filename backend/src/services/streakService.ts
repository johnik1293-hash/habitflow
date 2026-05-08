import { db } from "../database/db.js";

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getCurrentStreak(userId: number, habitId: number): number {
  const rows = db
    .prepare("SELECT date FROM habit_logs WHERE habit_id = ? AND user_id = ? ORDER BY date DESC LIMIT 366")
    .all(habitId, userId) as Array<{ date: string }>;

  const completed = new Set(rows.map((row) => row.date));
  const now = new Date();
  let streak = 0;

  for (let i = 0; i < 366; i += 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = toISODate(d);
    if (!completed.has(key)) break;
    streak += 1;
  }

  return streak;
}

export function getLongestStreak(userId: number, habitId: number): number {
  const rows = db
    .prepare("SELECT date FROM habit_logs WHERE habit_id = ? AND user_id = ? ORDER BY date ASC")
    .all(habitId, userId) as Array<{ date: string }>;
  if (!rows.length) return 0;

  let longest = 1;
  let current = 1;
  for (let i = 1; i < rows.length; i += 1) {
    const prev = new Date(rows[i - 1].date);
    const next = new Date(rows[i].date);
    const diffDays = Math.round((next.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else if (diffDays > 1) {
      current = 1;
    }
  }
  return longest;
}

