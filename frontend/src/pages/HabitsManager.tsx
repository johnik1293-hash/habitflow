import { useState } from "react";
import { HabitForm } from "../components/HabitForm";
import type { Habit } from "../types";

const HABIT_COLORS = [
  "#f97316", "#10b981", "#3b82f6", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f59e0b", "#84cc16"
];
function habitColor(id: number) {
  return HABIT_COLORS[id % HABIT_COLORS.length];
}

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
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const active = habits.filter((h) => Boolean(h.is_active));
  const paused = habits.filter((h) => !Boolean(h.is_active));

  async function handleDelete(habit: Habit) {
    setDeletingId(habit.id);
    await onDelete(habit.id);
    setDeletingId(null);
  }

  return (
    <section style={{ padding: "0 0 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <h2 style={{ fontWeight: 700, fontSize: "20px", margin: 0 }}>Мои привычки</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            background: "var(--tg-theme-button-color, #3b82f6)",
            color: "var(--tg-theme-button-text-color, #fff)",
            border: "none", borderRadius: "12px",
            padding: "8px 16px", fontWeight: 600, fontSize: "14px", cursor: "pointer"
          }}
        >
          {showForm ? "Отмена" : "+ Добавить"}
        </button>
      </div>

      {showForm && (
        <div style={{ marginBottom: "20px", background: "var(--tg-theme-secondary-bg-color, #f8f8f8)", borderRadius: "16px", padding: "16px" }}>
          <HabitForm submitLabel="Создать привычку" onSubmit={async (draft) => {
            await onCreate(draft);
            setShowForm(false);
          }} />
        </div>
      )}

      {/* Активные */}
      {active.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--tg-theme-hint-color, #999)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
            Активные · {active.length}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {active.map((habit) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                onToggle={onToggle}
                onDelete={handleDelete}
                deleting={deletingId === habit.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* На паузе */}
      {paused.length > 0 && (
        <div>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--tg-theme-hint-color, #999)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
            На паузе · {paused.length}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {paused.map((habit) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                onToggle={onToggle}
                onDelete={handleDelete}
                deleting={deletingId === habit.id}
                paused
              />
            ))}
          </div>
        </div>
      )}

      {habits.length === 0 && !showForm && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--tg-theme-hint-color, #999)" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🌱</div>
          <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "6px" }}>Ещё нет привычек</div>
          <div style={{ fontSize: "13px" }}>Нажми «+ Добавить», чтобы начать</div>
        </div>
      )}
    </section>
  );
}

function HabitRow({
  habit, onToggle, onDelete, deleting, paused = false
}: {
  habit: Habit;
  onToggle: (h: Habit) => Promise<void>;
  onDelete: (h: Habit) => Promise<void>;
  deleting: boolean;
  paused?: boolean;
}) {
  const color = habitColor(habit.id);

  return (
    <div style={{
      background: "var(--tg-theme-secondary-bg-color, #f8f8f8)",
      borderRadius: "14px", padding: "14px 16px",
      opacity: paused ? 0.6 : 1,
      borderLeft: `4px solid ${paused ? "var(--tg-theme-hint-color, #ccc)" : color}`,
      display: "flex", alignItems: "center", gap: "12px"
    }}>
      <span style={{ fontSize: "26px", flexShrink: 0 }}>{habit.emoji}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: "15px", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {habit.title}
        </div>
        {paused && (
          <div style={{ fontSize: "11px", color: "var(--tg-theme-hint-color, #999)" }}>⏸ На паузе · напоминания отключены</div>
        )}
      </div>

      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
        <button
          onClick={() => onToggle(habit)}
          title={paused ? "Возобновить" : "Поставить на паузу"}
          style={{
            background: paused ? `${color}20` : "var(--tg-theme-bg-color, #fff)",
            border: `1.5px solid ${paused ? color : "var(--tg-theme-hint-color, #ddd)"}`,
            borderRadius: "10px", padding: "7px 10px",
            cursor: "pointer", fontSize: "16px", lineHeight: 1
          }}
        >
          {paused ? "▶️" : "⏸"}
        </button>
        <button
          onClick={() => onDelete(habit)}
          disabled={deleting}
          title="Удалить"
          style={{
            background: "var(--tg-theme-bg-color, #fff)",
            border: "1.5px solid #ff4d4d44",
            borderRadius: "10px", padding: "7px 10px",
            cursor: deleting ? "not-allowed" : "pointer", fontSize: "16px", lineHeight: 1,
            opacity: deleting ? 0.5 : 1
          }}
        >
          🗑
        </button>
      </div>
    </div>
  );
}
