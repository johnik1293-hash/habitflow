import { useState } from "react";
import type { Habit } from "../types";

type HabitDraft = Partial<Habit>;

const INTERVALS = [
  { label: "30 минут", value: 30 },
  { label: "1 час",   value: 60 },
  { label: "2 часа",  value: 120 },
  { label: "3 часа",  value: 180 },
  { label: "4 часа",  value: 240 },
  { label: "6 часов", value: 360 },
];

const ACCENT = "var(--tg-theme-button-color, #2563eb)";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ position: "relative", display: "inline-block", width: 44, height: 24, cursor: "pointer", flexShrink: 0 }}>
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)}
        style={{ opacity: 0, width: 0, height: 0 }} />
      <span style={{ position: "absolute", inset: 0, background: on ? ACCENT : "var(--tg-theme-hint-color, #ccc)", borderRadius: 24, transition: "background 0.2s" }} />
      <span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 18, height: 18, background: "#fff", borderRadius: "50%", transition: "left 0.2s" }} />
    </label>
  );
}

export function HabitForm({
  initial,
  onSubmit,
  submitLabel
}: {
  initial?: HabitDraft;
  onSubmit: (draft: HabitDraft) => Promise<void> | void;
  submitLabel: string;
}) {
  const [title, setTitle]           = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  const [enabled, setEnabled]       = useState(!!initial?.reminder_time);
  const [isRepeat, setIsRepeat]     = useState(!!initial?.reminder_interval);
  const [startTime, setStartTime]   = useState(initial?.reminder_time ?? "09:00");
  const [endTime, setEndTime]       = useState(initial?.reminder_end ?? "22:00");
  const [interval, setInterval]     = useState(initial?.reminder_interval ?? 60);

  function buildReminder(): Pick<Habit, "reminder_time" | "reminder_interval" | "reminder_end"> {
    if (!enabled) return { reminder_time: null, reminder_interval: null, reminder_end: null };
    if (isRepeat)  return { reminder_time: startTime, reminder_interval: interval, reminder_end: endTime };
    return { reminder_time: startTime, reminder_interval: null, reminder_end: null };
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit({ title, description, ...buildReminder() });
      }}
      style={{ display: "grid", gap: 12 }}
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Название привычки"
        required
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Описание (необязательно)"
      />

      {/* Блок напоминания */}
      <div style={{ background: "var(--tg-theme-bg-color, #fff)", borderRadius: "14px", padding: "14px", border: "1.5px solid var(--tg-theme-hint-color, #e5e7eb)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: enabled ? "14px" : 0 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: "14px" }}>🔔 Напоминание</div>
            {!enabled && <div style={{ fontSize: "12px", color: "var(--tg-theme-hint-color, #999)", marginTop: "2px" }}>Бот напомнит в Telegram</div>}
          </div>
          <Toggle on={enabled} onChange={setEnabled} />
        </div>

        {enabled && (
          <>
            {/* Режим */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
              {[{ label: "Раз в день", repeat: false }, { label: "Повторять", repeat: true }].map(({ label, repeat }) => (
                <button
                  key={label} type="button"
                  onClick={() => setIsRepeat(repeat)}
                  style={{
                    padding: "9px", borderRadius: "10px", fontWeight: 600, fontSize: "13px",
                    background: isRepeat === repeat ? ACCENT : "var(--tg-theme-secondary-bg-color, #f8f8f8)",
                    color: isRepeat === repeat ? "#fff" : "var(--tg-theme-text-color, #000)",
                    border: `1.5px solid ${isRepeat === repeat ? ACCENT : "var(--tg-theme-hint-color, #ccc)"}`,
                    cursor: "pointer"
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {!isRepeat ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input type="time" value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={{ flex: 1, border: `1.5px solid ${ACCENT}`, background: "var(--tg-theme-bg-color, #fff)" }} />
                <span style={{ fontSize: "12px", color: "var(--tg-theme-hint-color, #999)", whiteSpace: "nowrap" }}>каждый день</span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "var(--tg-theme-hint-color, #999)", marginBottom: "6px" }}>Каждые</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {INTERVALS.map(({ label, value }) => (
                      <button
                        key={value} type="button"
                        onClick={() => setInterval(value)}
                        style={{
                          padding: "7px 12px", borderRadius: "20px", fontSize: "13px",
                          background: interval === value ? ACCENT : "var(--tg-theme-secondary-bg-color, #f8f8f8)",
                          color: interval === value ? "#fff" : "var(--tg-theme-text-color, #000)",
                          border: `1.5px solid ${interval === value ? ACCENT : "var(--tg-theme-hint-color, #ccc)"}`,
                          fontWeight: interval === value ? 600 : 400, cursor: "pointer"
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <div style={{ fontSize: "12px", color: "var(--tg-theme-hint-color, #999)", marginBottom: "4px" }}>С</div>
                    <input type="time" value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      style={{ border: `1.5px solid ${ACCENT}`, background: "var(--tg-theme-bg-color, #fff)" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "var(--tg-theme-hint-color, #999)", marginBottom: "4px" }}>До</div>
                    <input type="time" value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      style={{ border: `1.5px solid ${ACCENT}`, background: "var(--tg-theme-bg-color, #fff)" }} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <button type="submit" style={{
        background: "var(--tg-theme-button-color, #2563eb)",
        color: "var(--tg-theme-button-text-color, #fff)",
        border: "none", padding: "13px",
        fontWeight: 600, fontSize: "16px", borderRadius: "12px",
        cursor: "pointer"
      }}>
        {submitLabel}
      </button>
    </form>
  );
}
