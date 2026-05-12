import type { Habit } from "../types";

const COLORS = [
  "#6366f1","#ec4899","#10b981","#f59e0b",
  "#3b82f6","#8b5cf6","#06b6d4","#f97316"
];
function habitColor(id: number) { return COLORS[id % COLORS.length]; }

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
  const color = habitColor(habit.id);

  return (
    <article
      onClick={onOpen}
      style={{
        background: "#fff",
        borderRadius: "18px",
        padding: "16px",
        display: "flex", alignItems: "center", gap: "14px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.04)",
        cursor: onOpen ? "pointer" : "default",
        transition: "transform 0.15s, box-shadow 0.15s",
        position: "relative", overflow: "hidden"
      }}
    >
      {/* Цветная полоса слева */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: 4, background: color, borderRadius: "18px 0 0 18px"
      }} />

      {/* Эмодзи */}
      <div style={{
        width: 48, height: 48, borderRadius: "14px", flexShrink: 0,
        background: `${color}18`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "26px"
      }}>
        {habit.emoji}
      </div>

      {/* Текст */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {habit.title}
        </div>
        {(streak ?? 0) > 0 && (
          <div style={{ fontSize: "12px", color: "#f59e0b", fontWeight: 600 }}>
            🔥 {streak} дн подряд
          </div>
        )}
        {habit.reminder_time && (
          <div style={{ fontSize: "11px", color: "var(--hint)", marginTop: "2px" }}>
            🔔 {habit.reminder_time}
          </div>
        )}
      </div>

      {/* Кнопка Done */}
      {onDone && (
        <button
          onClick={(e) => { e.stopPropagation(); onDone(); }}
          style={{
            width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
            background: `${color}15`,
            border: `2px solid ${color}40`,
            color, fontSize: "20px",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 0
          }}
        >
          ✓
        </button>
      )}
    </article>
  );
}
