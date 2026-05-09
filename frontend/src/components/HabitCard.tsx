import type { Habit } from "../types";
import { StreakDisplay } from "./StreakDisplay";

export function HabitCard({
  habit,
  streak,
  onDone,
  onOpen
}: {
  habit: Habit;
  streak?: number;
  onDone?: () => void;
  onOpen?: () => void;
}) {
  return (
    <article style={{ border: "1px solid var(--tg-theme-hint-color, #ddd)", borderRadius: 12, padding: 12, marginBottom: 10, background: "var(--tg-theme-secondary-bg-color, #f8f8f8)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>
          {habit.emoji} {habit.title}
        </strong>
        <StreakDisplay streak={streak ?? 0} />
      </div>
      {habit.description && <p>{habit.description}</p>}
      <div style={{ display: "flex", gap: 8 }}>
        {onDone && (
          <button onClick={onDone} style={{ padding: "8px 10px" }}>
            ✅ Done
          </button>
        )}
        {onOpen && (
          <button onClick={onOpen} style={{ padding: "8px 10px" }}>
            Открыть
          </button>
        )}
      </div>
    </article>
  );
}

