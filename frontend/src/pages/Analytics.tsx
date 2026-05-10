import { useEffect, useState } from "react";
import { ActivityHeatmap } from "../components/ActivityHeatmap";
import { api } from "../services/api";
import type { Habit, Overview, User } from "../types";

const ACCENT = "#10b981";

export function Analytics({
  overview,
  habits,
  streakByHabitId,
  user,
}: {
  overview: Overview | null;
  habits: Habit[];
  streakByHabitId: Record<number, number>;
  user: User | null;
}) {
  const [heatmap, setHeatmap] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    api.getHeatmap(user).then(setHeatmap).catch(() => {});
  }, [user]);

  const topHabit = habits.reduce<Habit | null>((best, h) => {
    return (streakByHabitId[h.id] ?? 0) > (best ? (streakByHabitId[best.id] ?? 0) : -1) ? h : best;
  }, null);

  return (
    <section style={{ padding: "0 0 24px" }}>
      <h2 style={{ fontWeight: 700, fontSize: "20px", marginBottom: "16px" }}>Аналитика</h2>

      {/* Карточки-итоги */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
        <StatCard label="🔥 Лучший стрик" value={overview?.longest_streak ?? 0} unit="дн" accent={ACCENT} />
        <StatCard label="✅ Привычек" value={overview?.total_habits ?? 0} unit="шт" accent={ACCENT} />
        <StatCard label="📈 Выполнение" value={overview?.completion_rate ?? 0} unit="%" accent={ACCENT} />
        <StatCard label="⚡ Активных стриков" value={overview?.active_streaks ?? 0} unit="шт" accent={ACCENT} />
      </div>

      {/* Топ привычка */}
      {topHabit && (
        <div style={{
          background: `${ACCENT}15`, borderRadius: "16px", padding: "14px 16px",
          marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px",
          borderLeft: `4px solid ${ACCENT}`
        }}>
          <span style={{ fontSize: "28px" }}>{topHabit.emoji}</span>
          <div>
            <div style={{ fontSize: "11px", color: "var(--tg-theme-hint-color, #999)" }}>Лидер по стрику</div>
            <div style={{ fontWeight: 700, fontSize: "15px" }}>{topHabit.title}</div>
            <div style={{ fontSize: "13px", color: ACCENT, fontWeight: 600 }}>
              {streakByHabitId[topHabit.id] ?? 0} дней подряд 🔥
            </div>
          </div>
        </div>
      )}

      {/* Тепловая карта */}
      <div style={{
        background: "var(--tg-theme-secondary-bg-color, #f8f8f8)",
        borderRadius: "20px", padding: "20px"
      }}>
        <div style={{ fontWeight: 600, fontSize: "15px", marginBottom: "14px" }}>
          🗓 Активность за 90 дней
        </div>
        <ActivityHeatmap data={heatmap} accent={ACCENT} totalHabits={habits.length} />
      </div>
    </section>
  );
}

function StatCard({ label, value, unit, accent }: { label: string; value: number; unit: string; accent: string }) {
  return (
    <div style={{
      background: "var(--tg-theme-secondary-bg-color, #f8f8f8)",
      borderRadius: "14px", padding: "14px", textAlign: "center"
    }}>
      <div style={{ fontSize: "24px", fontWeight: 800, color: accent }}>
        {value}<span style={{ fontSize: "13px", fontWeight: 500, color: "var(--tg-theme-hint-color, #999)", marginLeft: "2px" }}>{unit}</span>
      </div>
      <div style={{ fontSize: "11px", color: "var(--tg-theme-hint-color, #999)", marginTop: "3px" }}>{label}</div>
    </div>
  );
}
