import { HabitCalendar } from "../components/HabitCalendar";
import type { Habit, HabitLog } from "../types";

const HABIT_COLORS = [
  "#f97316", "#10b981", "#3b82f6", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f59e0b", "#84cc16"
];

function habitColor(id: number) {
  return HABIT_COLORS[id % HABIT_COLORS.length];
}

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
  const color = habitColor(habit.id);
  const totalDone = logs.length;

  return (
    <section style={{ padding: "0 0 24px" }}>
      {/* Шапка */}
      <button
        onClick={onBack}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: "15px", color: "var(--tg-theme-hint-color, #999)",
          padding: "0 0 12px", display: "flex", alignItems: "center", gap: "4px"
        }}
      >
        ← Назад
      </button>

      <div style={{
        background: `linear-gradient(135deg, ${color}22, ${color}44)`,
        borderRadius: "20px", padding: "20px",
        marginBottom: "20px", borderLeft: `4px solid ${color}`
      }}>
        <div style={{ fontSize: "36px", marginBottom: "8px" }}>{habit.emoji}</div>
        <div style={{ fontWeight: 700, fontSize: "20px", marginBottom: "12px" }}>
          {habit.title}
        </div>

        {/* Статистика */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{
            background: "rgba(255,255,255,0.6)", borderRadius: "12px", padding: "12px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "28px", fontWeight: 800, color }}>{streak}</div>
            <div style={{ fontSize: "12px", color: "var(--tg-theme-hint-color, #666)", marginTop: "2px" }}>
              🔥 текущий стрик
            </div>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.6)", borderRadius: "12px", padding: "12px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "28px", fontWeight: 800, color }}>{totalDone}</div>
            <div style={{ fontSize: "12px", color: "var(--tg-theme-hint-color, #666)", marginTop: "2px" }}>
              ✅ всего выполнено
            </div>
          </div>
        </div>
      </div>

      {/* Календарь */}
      <div style={{
        background: "var(--tg-theme-secondary-bg-color, #f8f8f8)",
        borderRadius: "20px", padding: "20px"
      }}>
        <div style={{ fontWeight: 600, fontSize: "15px", marginBottom: "16px" }}>
          История выполнения
        </div>
        {logs.length === 0 ? (
          <div style={{
            textAlign: "center", color: "var(--tg-theme-hint-color, #999)",
            padding: "32px 0", fontSize: "14px"
          }}>
            Ещё нет отметок.<br />Начни выполнять привычку каждый день!
          </div>
        ) : (
          <HabitCalendar logs={logs} color={color} />
        )}
      </div>
    </section>
  );
}
