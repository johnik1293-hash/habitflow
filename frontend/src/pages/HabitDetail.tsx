import { useState } from "react";
import { HabitCalendar } from "../components/HabitCalendar";
import type { Habit, HabitLog } from "../types";

const HABIT_COLORS = [
  "#f97316", "#10b981", "#3b82f6", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f59e0b", "#84cc16"
];

const INTERVALS = [
  { label: "30 минут", value: 30 },
  { label: "1 час",   value: 60 },
  { label: "2 часа",  value: 120 },
  { label: "3 часа",  value: 180 },
  { label: "4 часа",  value: 240 },
  { label: "6 часов", value: 360 },
];

function habitColor(id: number) {
  return HABIT_COLORS[id % HABIT_COLORS.length];
}

function Toggle({ on, color, onChange }: { on: boolean; color: string; onChange: (v: boolean) => void }) {
  return (
    <label style={{ position: "relative", display: "inline-block", width: 44, height: 24, cursor: "pointer", flexShrink: 0 }}>
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)}
        style={{ opacity: 0, width: 0, height: 0 }} />
      <span style={{ position: "absolute", inset: 0, background: on ? color : "var(--tg-theme-hint-color, #ccc)", borderRadius: 24, transition: "background 0.2s" }} />
      <span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 18, height: 18, background: "#fff", borderRadius: "50%", transition: "left 0.2s" }} />
    </label>
  );
}

export function HabitDetail({
  habit, logs, streak, onBack, onUpdate
}: {
  habit: Habit;
  logs: HabitLog[];
  streak: number;
  onBack: () => void;
  onUpdate?: (patch: Partial<Habit>) => Promise<void>;
}) {
  const color = habitColor(habit.id);
  const totalDone = logs.length;

  const [enabled, setEnabled]         = useState(!!habit.reminder_time);
  const [isRepeat, setIsRepeat]        = useState(!!habit.reminder_interval);
  const [startTime, setStartTime]      = useState(habit.reminder_time ?? "09:00");
  const [endTime, setEndTime]          = useState(habit.reminder_end ?? "22:00");
  const [interval, setIntervalVal]     = useState(habit.reminder_interval ?? 60);
  const [saving, setSaving]            = useState(false);
  const [saved, setSaved]              = useState(false);

  async function save(patch: Partial<Habit>) {
    if (!onUpdate) return;
    setSaving(true);
    setSaved(false);
    try {
      await onUpdate(patch);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(on: boolean) {
    setEnabled(on);
    if (!on) {
      await save({ reminder_time: null, reminder_interval: null, reminder_end: null });
    } else {
      await save(buildPatch(isRepeat, startTime, endTime, interval));
    }
  }

  function handleModeChange(repeat: boolean) {
    setIsRepeat(repeat);
    setSaved(false);
  }

  function handleChange(field: "start" | "end" | "interval", val: string | number) {
    if (field === "start")    setStartTime(val as string);
    if (field === "end")      setEndTime(val as string);
    if (field === "interval") setIntervalVal(val as number);
    setSaved(false);
  }

  async function handleSave() {
    await save(buildPatch(isRepeat, startTime, endTime, interval));
  }

  return (
    <section style={{ padding: "0 0 24px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "15px", color: "var(--tg-theme-hint-color, #999)", padding: "0 0 12px", display: "flex", alignItems: "center", gap: "4px" }}>
        ← Назад
      </button>

      {/* Шапка */}
      <div style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)`, borderRadius: "20px", padding: "20px", marginBottom: "16px", borderLeft: `4px solid ${color}` }}>
        <div style={{ fontSize: "36px", marginBottom: "8px" }}>{habit.emoji}</div>
        <div style={{ fontWeight: 700, fontSize: "20px", marginBottom: "12px" }}>{habit.title}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: 800, color }}>{streak}</div>
            <div style={{ fontSize: "12px", color: "var(--tg-theme-hint-color, #666)", marginTop: "2px" }}>🔥 текущий стрик</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: 800, color }}>{totalDone}</div>
            <div style={{ fontSize: "12px", color: "var(--tg-theme-hint-color, #666)", marginTop: "2px" }}>✅ всего выполнено</div>
          </div>
        </div>
      </div>

      {/* Напоминание */}
      <div style={{ background: "var(--tg-theme-secondary-bg-color, #f8f8f8)", borderRadius: "20px", padding: "20px", marginBottom: "16px" }}>
        {/* Заголовок + тоггл */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: enabled ? "16px" : 0 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: "15px" }}>🔔 Напоминание</div>
            {!enabled && <div style={{ fontSize: "12px", color: "var(--tg-theme-hint-color, #999)", marginTop: "2px" }}>Бот напомнит в Telegram</div>}
          </div>
          <Toggle on={enabled} color={color} onChange={handleToggle} />
        </div>

        {enabled && (
          <>
            {/* Режим: раз в день / повторять */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
              {[{ label: "Раз в день", repeat: false }, { label: "Повторять", repeat: true }].map(({ label, repeat }) => (
                <button key={label} onClick={() => handleModeChange(repeat)} style={{
                  padding: "10px", borderRadius: "10px", fontWeight: 600, fontSize: "14px",
                  background: isRepeat === repeat ? color : "var(--tg-theme-bg-color, #fff)",
                  color: isRepeat === repeat ? "#fff" : "var(--tg-theme-text-color, #000)",
                  border: `1.5px solid ${isRepeat === repeat ? color : "var(--tg-theme-hint-color, #ccc)"}`
                }}>
                  {label}
                </button>
              ))}
            </div>

            {!isRepeat ? (
              /* Раз в день — только время */
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input type="time" value={startTime}
                  onChange={(e) => handleChange("start", e.target.value)}
                  style={{ flex: 1, border: `1.5px solid ${color}`, background: "var(--tg-theme-bg-color, #fff)" }} />
                <span style={{ fontSize: "13px", color: "var(--tg-theme-hint-color, #999)", whiteSpace: "nowrap" }}>
                  каждый день
                </span>
              </div>
            ) : (
              /* Повторять каждые N — интервал + окно */
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "var(--tg-theme-hint-color, #999)", marginBottom: "6px" }}>Каждые</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {INTERVALS.map(({ label, value }) => (
                      <button key={value} onClick={() => handleChange("interval", value)} style={{
                        padding: "8px 14px", borderRadius: "20px", fontSize: "14px",
                        background: interval === value ? color : "var(--tg-theme-bg-color, #fff)",
                        color: interval === value ? "#fff" : "var(--tg-theme-text-color, #000)",
                        border: `1.5px solid ${interval === value ? color : "var(--tg-theme-hint-color, #ccc)"}`,
                        fontWeight: interval === value ? 600 : 400
                      }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <div style={{ fontSize: "12px", color: "var(--tg-theme-hint-color, #999)", marginBottom: "6px" }}>С</div>
                    <input type="time" value={startTime}
                      onChange={(e) => handleChange("start", e.target.value)}
                      style={{ border: `1.5px solid ${color}`, background: "var(--tg-theme-bg-color, #fff)" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "var(--tg-theme-hint-color, #999)", marginBottom: "6px" }}>До</div>
                    <input type="time" value={endTime}
                      onChange={(e) => handleChange("end", e.target.value)}
                      style={{ border: `1.5px solid ${color}`, background: "var(--tg-theme-bg-color, #fff)" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Кнопка сохранить */}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                marginTop: "14px", width: "100%", padding: "13px",
                background: saved ? "#10b981" : color,
                color: "#fff", border: "none", borderRadius: "12px",
                fontWeight: 700, fontSize: "15px",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
                transition: "background 0.3s"
              }}
            >
              {saving ? "Сохраняем…" : saved ? "✓ Сохранено" : "Сохранить"}
            </button>
          </>
        )}
      </div>

      {/* Календарь */}
      <div style={{ background: "var(--tg-theme-secondary-bg-color, #f8f8f8)", borderRadius: "20px", padding: "20px" }}>
        <div style={{ fontWeight: 600, fontSize: "15px", marginBottom: "16px" }}>История выполнения</div>
        {logs.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--tg-theme-hint-color, #999)", padding: "32px 0", fontSize: "14px" }}>
            Ещё нет отметок.<br />Начни выполнять привычку каждый день!
          </div>
        ) : (
          <HabitCalendar logs={logs} color={color} />
        )}
      </div>
    </section>
  );
}

function buildPatch(repeat: boolean, start: string, end: string, interval: number): Partial<Habit> {
  return repeat
    ? { reminder_time: start, reminder_interval: interval, reminder_end: end }
    : { reminder_time: start, reminder_interval: null, reminder_end: null };
}
