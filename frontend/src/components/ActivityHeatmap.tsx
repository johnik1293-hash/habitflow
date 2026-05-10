const WEEKS = 13;
const DAYS = 7;
const DAY_LABELS = ["Пн", "", "Ср", "", "Пт", "", "Вс"];

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildGrid(): Date[] {
  // Строим 13 полных недель назад от сегодня (заканчивая воскресеньем текущей недели)
  const today = new Date();
  // Понедельник текущей недели
  const dow = (today.getDay() + 6) % 7; // 0=Пн, 6=Вс
  const startMonday = new Date(today);
  startMonday.setDate(today.getDate() - dow - (WEEKS - 1) * 7);
  startMonday.setHours(0, 0, 0, 0);

  const cells: Date[] = [];
  for (let i = 0; i < WEEKS * DAYS; i++) {
    const d = new Date(startMonday);
    d.setDate(startMonday.getDate() + i);
    cells.push(d);
  }
  return cells;
}

function cellColor(count: number, maxCount: number, accent: string): string {
  if (count === 0) return "var(--tg-theme-secondary-bg-color, #f0f0f0)";
  const intensity = Math.min(1, count / Math.max(maxCount, 1));
  // от 30% до 100% непрозрачности акцентного цвета
  const alpha = Math.round((0.3 + intensity * 0.7) * 255).toString(16).padStart(2, "0");
  return `${accent}${alpha}`;
}

export function ActivityHeatmap({
  data,
  accent = "#10b981",
  totalHabits = 0,
}: {
  data: { date: string; count: number }[];
  accent?: string;
  totalHabits?: number;
}) {
  const grid = buildGrid();
  const today = toLocalDateStr(new Date());

  const countByDate = new Map<string, number>(data.map((r) => [r.date, Number(r.count)]));
  const maxCount = Math.max(1, ...data.map((r) => Number(r.count)));

  // Итоги за 90 дней
  const total90 = data.reduce((s, r) => s + Number(r.count), 0);
  const activeDays = data.length;

  // Месячные метки — первый день месяца в сетке
  const monthLabels: { col: number; label: string }[] = [];
  const MONTH_RU = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];
  for (let w = 0; w < WEEKS; w++) {
    const d = grid[w * DAYS];
    if (d.getDate() <= 7) {
      monthLabels.push({ col: w, label: MONTH_RU[d.getMonth()] });
    }
  }

  const CELL = 14;
  const GAP = 3;
  const step = CELL + GAP;

  return (
    <div>
      {/* Итоговые плашки */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
        <div style={{
          background: `${accent}18`, borderRadius: "12px", padding: "12px",
          textAlign: "center", borderLeft: `3px solid ${accent}`
        }}>
          <div style={{ fontSize: "22px", fontWeight: 800, color: accent }}>{total90}</div>
          <div style={{ fontSize: "11px", color: "var(--tg-theme-hint-color, #999)", marginTop: "2px" }}>выполнений за 90 дней</div>
        </div>
        <div style={{
          background: `${accent}18`, borderRadius: "12px", padding: "12px",
          textAlign: "center", borderLeft: `3px solid ${accent}`
        }}>
          <div style={{ fontSize: "22px", fontWeight: 800, color: accent }}>{activeDays}</div>
          <div style={{ fontSize: "11px", color: "var(--tg-theme-hint-color, #999)", marginTop: "2px" }}>активных дней</div>
        </div>
      </div>

      {/* Сетка */}
      <div style={{ overflowX: "auto", paddingBottom: "4px" }}>
        <div style={{ display: "flex", gap: `${GAP}px`, position: "relative", paddingTop: "18px" }}>
          {/* Метки дней недели */}
          <div style={{
            display: "flex", flexDirection: "column", gap: `${GAP}px`,
            flexShrink: 0, paddingTop: "0px"
          }}>
            {DAY_LABELS.map((label, i) => (
              <div key={i} style={{
                height: CELL, width: 20, fontSize: "9px",
                color: "var(--tg-theme-hint-color, #999)",
                display: "flex", alignItems: "center",
                flexShrink: 0
              }}>
                {label}
              </div>
            ))}
          </div>

          {/* Колонки-недели */}
          <div style={{ display: "flex", gap: `${GAP}px`, position: "relative" }}>
            {/* Метки месяцев */}
            {monthLabels.map(({ col, label }) => (
              <div key={col} style={{
                position: "absolute", top: -16, left: col * step,
                fontSize: "9px", color: "var(--tg-theme-hint-color, #999)",
                whiteSpace: "nowrap"
              }}>
                {label}
              </div>
            ))}

            {Array.from({ length: WEEKS }, (_, w) => (
              <div key={w} style={{ display: "flex", flexDirection: "column", gap: `${GAP}px` }}>
                {Array.from({ length: DAYS }, (_, d) => {
                  const date = grid[w * DAYS + d];
                  const dateStr = toLocalDateStr(date);
                  const count = countByDate.get(dateStr) ?? 0;
                  const isToday = dateStr === today;
                  const isFuture = dateStr > today;

                  return (
                    <div
                      key={d}
                      title={`${dateStr}: ${count} выполн.`}
                      style={{
                        width: CELL, height: CELL, borderRadius: 3, flexShrink: 0,
                        background: isFuture
                          ? "var(--tg-theme-secondary-bg-color, #f0f0f0)"
                          : cellColor(count, maxCount, accent),
                        opacity: isFuture ? 0.3 : 1,
                        outline: isToday ? `2px solid ${accent}` : "none",
                        outlineOffset: 1,
                        boxSizing: "border-box",
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Легенда */}
      <div style={{
        display: "flex", alignItems: "center", gap: "6px",
        marginTop: "10px", justifyContent: "flex-end"
      }}>
        <span style={{ fontSize: "10px", color: "var(--tg-theme-hint-color, #999)" }}>Меньше</span>
        {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: 2,
            background: v === 0
              ? "var(--tg-theme-secondary-bg-color, #f0f0f0)"
              : cellColor(Math.round(v * maxCount), maxCount, accent)
          }} />
        ))}
        <span style={{ fontSize: "10px", color: "var(--tg-theme-hint-color, #999)" }}>Больше</span>
      </div>
    </div>
  );
}
