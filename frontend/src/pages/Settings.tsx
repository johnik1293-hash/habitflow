import { useState } from "react";
import WebApp from "@twa-dev/sdk";
import { api } from "../services/api";
import type { User } from "../types";

function isPremiumActive(user: User): boolean {
  if (user.subscription_tier !== "premium") return false;
  if (!user.subscription_expires_at) return true;
  return new Date(user.subscription_expires_at) > new Date();
}

export function Settings({
  user,
  onUpdateTimezone,
  onPremiumActivated
}: {
  user: User | null;
  onUpdateTimezone: (timezone: string) => Promise<void>;
  onPremiumActivated?: () => void;
}) {
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const premium = user ? isPremiumActive(user) : false;
  const expiresAt = user?.subscription_expires_at
    ? new Date(user.subscription_expires_at).toLocaleDateString("ru-RU")
    : null;

  async function handleBuyPremium() {
    setError(null);
    setBuying(true);
    try {
      const { url } = await api.getInvoiceLink();
      WebApp.openInvoice(url, (status) => {
        setBuying(false);
        if (status === "paid") {
          onPremiumActivated?.();
        } else if (status === "failed" || status === "cancelled") {
          setError(status === "cancelled" ? null : "Ошибка оплаты. Попробуй ещё раз.");
        }
      });
    } catch {
      setBuying(false);
      setError("Не удалось открыть оплату. Попробуй через бота: /premium");
    }
  }

  return (
    <section style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Блок подписки */}
      <div style={{
        background: premium
          ? "linear-gradient(135deg, #f6d365 0%, #fda085 100%)"
          : "var(--tg-theme-secondary-bg-color, #f0f0f0)",
        borderRadius: "16px",
        padding: "20px",
        color: premium ? "#fff" : "inherit"
      }}>
        <div style={{ fontSize: "28px", marginBottom: "8px" }}>
          {premium ? "⭐" : "🔒"}
        </div>
        <div style={{ fontWeight: 700, fontSize: "18px", marginBottom: "4px" }}>
          {premium ? "Premium активен" : "HabitFlow Free"}
        </div>
        <div style={{ fontSize: "14px", opacity: 0.85, marginBottom: "16px" }}>
          {premium
            ? expiresAt ? `Активен до ${expiresAt}` : "Активен"
            : "До 2 привычек · Базовая аналитика"}
        </div>

        {!premium && (
          <>
            <div style={{ fontSize: "13px", marginBottom: "12px", lineHeight: 1.5 }}>
              <b>Premium (250 ⭐/месяц):</b>
              <br />• Неограниченные привычки
              <br />• Расширенная аналитика
            </div>
            <button
              onClick={handleBuyPremium}
              disabled={buying}
              style={{
                width: "100%",
                padding: "12px",
                background: "#fff",
                color: "#e8722a",
                border: "none",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "15px",
                cursor: buying ? "default" : "pointer",
                opacity: buying ? 0.7 : 1
              }}
            >
              {buying ? "Открываем оплату…" : "Купить Premium — 250 ⭐"}
            </button>
            {error && (
              <div style={{ marginTop: "8px", fontSize: "13px", color: "#fff", opacity: 0.9 }}>
                {error}
              </div>
            )}
          </>
        )}
      </div>

      {/* Профиль */}
      <div style={{
        background: "var(--tg-theme-secondary-bg-color, #f0f0f0)",
        borderRadius: "16px",
        padding: "16px"
      }}>
        <div style={{ fontWeight: 600, marginBottom: "12px" }}>Профиль</div>
        <div style={{ fontSize: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div>Telegram ID: {user?.telegram_id ?? "—"}</div>
          <div>Timezone: {user?.timezone ?? "—"}</div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: "12px", flexWrap: "wrap" }}>
          {["UTC", "Europe/Moscow", "Asia/Bangkok", "America/New_York"].map((tz) => (
            <button
              key={tz}
              onClick={() => onUpdateTimezone(tz)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid var(--tg-theme-hint-color, #999)",
                background: user?.timezone === tz ? "var(--tg-theme-button-color, #2563eb)" : "transparent",
                color: user?.timezone === tz ? "#fff" : "inherit",
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              {tz.split("/").pop()}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
