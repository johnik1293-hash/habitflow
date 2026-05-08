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
              border: page === item.key ? "2px solid #111" : "1px solid #ccc",
              background: "white"
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </main>
  );
}

