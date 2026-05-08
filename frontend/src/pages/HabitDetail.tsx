import type { Habit, HabitLog } from "../types";

export function HabitDetail({
  habit,
  logs,
  streak,
  onBack
}: {
  habit: Habit;
  logs: HabitLog[];
  streak: number;
  onBack: () => void;
}) {
  return (
    <section>
      <button onClick={onBack}>← Назад</button>
      <h2>
        {habit.emoji} {habit.title}
      </h2>
      <p>Текущий streak: 🔥 {streak}</p>
      <h3>История</h3>
      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            {log.date} {log.notes ? `— ${log.notes}` : ""}
          </li>
        ))}
      </ul>
    </section>
  );
}

