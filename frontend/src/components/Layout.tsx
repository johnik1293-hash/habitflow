import { ReactNode } from "react";

type PageKey = "dashboard" | "habits" | "analytics" | "settings";

const nav: Array<{ key: PageKey; label: string; icon: string }> = [
  { key: "dashboard", label: "Главная",   icon: "🏠" },
  { key: "habits",    label: "Привычки",  icon: "✅" },
  { key: "analytics", label: "Статистика", icon: "📊" },
  { key: "settings",  label: "Профиль",   icon: "⚙️" },
];

export function Layout({
  title,
  page,
  onNavigate,
  children
}: {
  title: string;
  page: PageKey;
  onNavigate: (page: PageKey) => void;
  children: ReactNode;
}) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", minHeight: "100dvh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>

      {/* Шапка */}
      <header style={{
        padding: "16px 20px 12px",
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        boxShadow: "0 2px 16px rgba(99,102,241,0.3)",
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", alignItems: "center", gap: "10px"
      }}>
        <span style={{ fontSize: "22px" }}>⚡</span>
        <span style={{ fontWeight: 800, fontSize: "20px", color: "#fff", letterSpacing: "-0.3px" }}>
          HabitFlow
        </span>
      </header>

      {/* Контент */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 88px" }}>
        {children}
      </div>

      {/* Нижняя навигация */}
      <nav style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 560,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(99,102,241,0.1)",
        display: "grid", gridTemplateColumns: "repeat(4,1fr)",
        padding: "8px 4px calc(8px + env(safe-area-inset-bottom))",
        zIndex: 200,
        boxShadow: "0 -4px 24px rgba(99,102,241,0.08)"
      }}>
        {nav.map((item) => {
          const active = page === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: "3px", padding: "6px 4px",
                background: "none", border: "none",
                color: active ? "#6366f1" : "#94a3b8",
                fontWeight: active ? 700 : 400,
                borderRadius: "12px",
                position: "relative",
                transition: "color 0.2s"
              }}
            >
              {active && (
                <span style={{
                  position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                  width: 32, height: 3, background: "#6366f1",
                  borderRadius: "0 0 4px 4px"
                }} />
              )}
              <span style={{ fontSize: "22px", lineHeight: 1 }}>{item.icon}</span>
              <span style={{ fontSize: "10px", letterSpacing: "0.2px" }}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
