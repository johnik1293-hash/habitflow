import { ReactNode } from "react";

type PageKey = "dashboard" | "habits" | "analytics" | "settings";

const nav: Array<{ key: PageKey; label: string }> = [
  { key: "dashboard", label: "Главная" },
  { key: "habits", label: "Привычки" },
  { key: "analytics", label: "Аналитика" },
  { key: "settings", label: "Настройки" }
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
    <main style={{ maxWidth: 560, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ marginTop: 0 }}>{title}</h1>
      {children}
      <nav style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
        {nav.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            style={{
              padding: "10px 8px",
              borderRadius: 10,
              border: page === item.key
                ? "2px solid var(--tg-theme-button-color, #2563eb)"
                : "1px solid var(--tg-theme-hint-color, #ccc)",
              background: page === item.key
                ? "var(--tg-theme-button-color, #2563eb)"
                : "var(--tg-theme-secondary-bg-color, #f0f0f0)",
              color: page === item.key
                ? "var(--tg-theme-button-text-color, #fff)"
                : "var(--tg-theme-text-color, #000)",
              fontWeight: page === item.key ? 600 : 400
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </main>
  );
}

