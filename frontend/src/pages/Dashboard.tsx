import { HabitCard } from "../components/HabitCard";
import type { Habit, Overview } from "../types";

function greeting() {
  const h = new Date().getHours();
  if (h < 6)  return "Ночное время 🌙";
  if (h < 12) return "Доброе утро ☀️";
  if (h < 17) return "Добрый день 🌤";
  if (h < 22) return "Добрый вечер 🌆";
  return "Ночное время 🌙";
}

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
  const activeHabits = habits.filter((h) => Boolean(h.is_active));
  const bestStreak = Math.max(0, ...Object.values(streakByHabitId));

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Hero-карточка */}
      <div style={{
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
        borderRadius: "24px",
        padding: "24px",
        color: "#fff",
        boxShadow: "0 8px 32px rgba(99,102,241,0.35)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Декор */}
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", bottom: -20, right: 40, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />

        <div style={{ position: "relative" }}>
          <div style={{ fontSize: "13px", opacity: 0.85, marginBottom: "4px", fontWeight: 500 }}>{greeting()}</div>
          <div style={{ fontSize: "22px", fontWeight: 800, marginBottom: "20px", letterSpacing: "-0.5px" }}>
            Твой прогресс сегодня
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <HeroStat value={overview?.total_habits ?? 0} label="привычек" />
            <HeroStat value={bestStreak} label="макс стрик" emoji="🔥" />
            <HeroStat value={`${overview?.completion_rate ?? 0}%`} label="выполнено" />
          </div>
        </div>
      </div>

      {/* Кнопка добавить */}
      <button
        onClick={onCreateHabit}
        style={{
          width: "100%", padding: "15px",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "#fff", border: "none",
          borderRadius: "16px", fontWeight: 700, fontSize: "15px",
          boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
        }}
      >
        <span style={{ fontSize: "18px" }}>+</span> Добавить привычку
      </button>

      {/* Список привычек */}
      {activeHabits.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "48px 24px",
          background: "#fff", borderRadius: "20px",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{ fontSize: "56px", marginBottom: "12px" }}>🌱</div>
          <div style={{ fontWeight: 700, fontSize: "17px", marginBottom: "6px", color: "var(--text)" }}>
            Ещё нет привычек
          </div>
          <div style={{ fontSize: "14px", color: "var(--hint)", lineHeight: 1.5 }}>
            Добавь первую привычку,<br />чтобы начать отслеживать прогресс
          </div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--hint)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
            Сегодня · {activeHabits.length} привычек
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {activeHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                streak={streakByHabitId[habit.id] ?? 0}
                onDone={() => onDoneHabit(habit.id)}
                onOpen={() => onOpenHabit(habit.id)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function HeroStat({ value, label, emoji }: { value: string | number; label: string; emoji?: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "26px", fontWeight: 800, lineHeight: 1 }}>
        {emoji && <span style={{ fontSize: "16px" }}>{emoji}</span>}
        {value}
      </div>
      <div style={{ fontSize: "11px", opacity: 0.8, marginTop: "3px" }}>{label}</div>
    </div>
  );
}
