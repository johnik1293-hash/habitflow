import { HabitForm } from "../components/HabitForm";
import type { Habit } from "../types";

export function HabitsManager({
  habits,
  onCreate,
  onToggle,
  onDelete
}: {
  habits: Habit[];
  onCreate: (draft: Partial<Habit>) => Promise<void>;
  onToggle: (habit: Habit) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  return (
    <section>
      <h2>Управление привычками</h2>
      <HabitForm submitLabel="Создать привычку" onSubmit={onCreate} />
      <hr />
      {habits.map((habit) => (
        <div key={habit.id} style={{ border: "1px solid #ddd", padding: 10, borderRadius: 10, marginBottom: 8 }}>
          <strong>
            {habit.emoji} {habit.title}
          </strong>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={() => onToggle(habit)}>{habit.is_active ? "Архивировать" : "Активировать"}</button>
            <button onClick={() => onDelete(habit.id)}>Удалить</button>
          </div>
        </div>
      ))}
    </section>
  );
}

