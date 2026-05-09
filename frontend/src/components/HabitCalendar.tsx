import { useState } from "react";
import type { HabitLog } from "../types";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// Monday-based: Mon=0 ... Sun=6
function getFirstDayOffset(year: number, month: number) {
  const day = new Date(year, month, 1).getDay(); // 0=Sun
  return day === 0 ? 6 : day - 1;
}

export function HabitCalendar({ logs, color = "#f97316" }: { logs: HabitLog[]; color?: string }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const completedDates = new Set(logs.map((l) => l.date));

  const daysInMonth = getDaysInMonth(year, month);
  const offset = getFirstDayOffset(year, month);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
    if (isCurrentMonth) return;
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  const cells: Array<{ day: number | null }> = [
    ...Array(offset).fill({ day: null }),
    ...Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1 }))
  ];
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push({ day: null });

  return (
    <div style={{ userSelect: "none" }}>
      {/* Навигация по месяцам */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "16px"
      }}>
        <button onClick={prevMonth} style={navBtnStyle}>‹</button>
        <span style={{ fontWeight: 600, fontSize: "16px" }}>
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          disabled={isCurrentMonth}
          style={{ ...navBtnStyle, opacity: isCurrentMonth ? 0.3 : 1 }}
        >›</button>
      </div>

      {/* Заголовки дней недели */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "6px" }}>
        {WEEKDAYS.map((d) => (
          <div key={d} style={{
            textAlign: "center", fontSize: "12px",
            color: "var(--tg-theme-hint-color, #999)", fontWeight: 600,
            padding: "4px 0"
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Дни */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
        {cells.map((cell, i) => {
          if (!cell.day) return <div key={i} />;

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`;
          const done = completedDates.has(dateStr);
          const isToday = cell.day === today.getDate() && isCurrentMonth;
          const isFuture = isCurrentMonth && cell.day > today.getDate();

          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              aspectRatio: "1",
              borderRadius: "50%",
              background: done ? color : "transparent",
              border: isToday && !done ? `2px solid ${color}` : "2px solid transparent",
              color: done ? "#fff" : isFuture ? "var(--tg-theme-hint-color, #ccc)" : "inherit",
              fontSize: "14px",
              fontWeight: done || isToday ? 700 : 400,
              transition: "all 0.15s"
            }}>
              {cell.day}
            </div>
          );
        })}
      </div>

      {/* Легенда */}
      <div style={{
        display: "flex", gap: "16px", marginTop: "16px",
        fontSize: "12px", color: "var(--tg-theme-hint-color, #999)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: color }} />
          Выполнено
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${color}` }} />
          Сегодня
        </div>
      </div>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  width: 36, height: 36,
  borderRadius: "50%",
  border: "1px solid var(--tg-theme-hint-color, #ccc)",
  background: "transparent",
  fontSize: "20px",
  cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  lineHeight: 1,
  color: "inherit"
};
