import { ProgressChart } from "../components/ProgressChart";
import type { Habit, Overview } from "../types";

export function Analytics({
  overview,
  habits,
  streakByHabitId
}: {
  overview: Overview | null;
  habits: Habit[];
  streakByHabitId: Record<number, number>;
}) {
  const data = habits.map((habit) => ({ label: habit.title, value: streakByHabitId[habit.id] ?? 0 }));
  return (
    <section>
      <h2>Аналитика</h2>
      <p>
        Longest streak: <strong>{overview?.longest_streak ?? 0}</strong>
      </p>
      <ProgressChart data={data} />
    </section>
  );
}

