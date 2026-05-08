import type { User } from "../types";

export function Settings({
  user,
  onUpdateTimezone
}: {
  user: User | null;
  onUpdateTimezone: (timezone: string) => Promise<void>;
}) {
  return (
    <section>
      <h2>Настройки</h2>
      <p>Telegram ID: {user?.telegram_id ?? "-"}</p>
      <p>Timezone: {user?.timezone ?? "-"}</p>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onUpdateTimezone("UTC")}>UTC</button>
        <button onClick={() => onUpdateTimezone("Asia/Bangkok")}>Asia/Bangkok</button>
      </div>
    </section>
  );
}

