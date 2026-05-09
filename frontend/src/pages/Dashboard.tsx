import { HabitCard } from "../components/HabitCard";
import type { Habit, Overview } from "../types";

export function Dashboard({
  habits,
  streakByHabitId,
  overview,
  onDoneHabit,
  onOpenHabit,
  onCreateHabit
}: {
  habits: Habit[];
  streakByHabitId: Record<number, number>;
  overview: Overview | null;
  onDoneHabit: (id: number) => void;
  onOpenHabit: (id: number) => void;
  onCreateHabit: () => void;
}) {
  return (
    <section>
      <p>Твой дневной прогресс и быстрые действия.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 12 }}>
        <div style={{ border: "1px solid var(--tg-theme-hint-color, #ddd)", borderRadius: 10, padding: 10, background: "var(--tg-theme-secondary-bg-color, #f8f8f8)" }}>
          Активные: <strong>{overview?.total_habits ?? 0}</strong>
        </div>
        <div style={{ border: "1px solid var(--tg-theme-hint-color, #ddd)", borderRadius: 10, padding: 10, background: "var(--tg-theme-secondary-bg-color, #f8f8f8)" }}>
          Completion: <strong>{overview?.completion_rate ?? 0}%</strong>
        </div>
      </div>
      <button onClick={onCreateHabit} style={{ marginBottom: 12 }}>
        + Добавить привычку
      </button>
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          streak={streakByHabitId[habit.id] ?? 0}
          onDone={() => onDoneHabit(habit.id)}
          onOpen={() => onOpenHabit(habit.id)}
        />
      ))}
    </section>
  );
}
