import { Router } from "express";
import { sql } from "../../database/db";
import { sendTelegramMessage } from "../../utils/telegram";

const PREMIUM_STARS = 250;
const PREMIUM_DAYS = 30;
const INVOICE_PAYLOAD = "habitflow_premium_monthly";

export const tributeRouter = Router();

// @tribute sends POST when user subscribes/unsubscribes
// Configure webhook URL in @tribute as: https://your-backend.vercel.app/api/tribute/webhook
// Set TRIBUTE_SECRET env var and configure it in @tribute bot settings
tributeRouter.post("/webhook", async (req, res) => {
  const secret = req.headers["x-tribute-secret"] ?? req.body?.secret;
  if (process.env.TRIBUTE_SECRET && secret !== process.env.TRIBUTE_SECRET) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const { event, subscriber } = req.body ?? {};
  const telegramId: number | undefined = subscriber?.telegram_id ?? subscriber?.id;

  if (!telegramId) {
    res.status(400).json({ error: "missing telegram_id" });
    return;
  }

  if (event === "subscribe" || event === "charge") {
    // Active subscription — set premium for 31 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 31);

    await sql`
      UPDATE users
      SET subscription_tier = 'premium',
          subscription_expires_at = ${expiresAt.toISOString()},
          updated_at = CURRENT_TIMESTAMP
      WHERE telegram_id = ${telegramId}
    `;

    await sendTelegramMessage(
      telegramId,
      "🎉 Premium активирован! Теперь ты можешь добавлять неограниченное количество привычек. Спасибо за поддержку!"
    );
  } else if (event === "unsubscribe" || event === "expire") {
    await sql`
      UPDATE users
      SET subscription_tier = 'free',
          subscription_expires_at = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE telegram_id = ${telegramId}
    `;

    await sendTelegramMessage(
      telegramId,
      "📋 Подписка Premium завершена. Твои привычки сохранены, но добавление новых ограничено до 2. Продли подписку: https://tribute.tg/habitflow"
    );
  }

  res.json({ ok: true });
});

// GET /api/tribute/invoice-link — создаёт Stars invoice link для Mini App
tributeRouter.get("/invoice-link", async (_req, res) => {
  const token = process.env.BOT_TOKEN;
  if (!token) { res.status(500).json({ error: "BOT_TOKEN not configured" }); return; }

  const response = await fetch(`https://api.telegram.org/bot${token}/createInvoiceLink`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title: "HabitFlow Premium",
      description: `Неограниченные привычки на ${PREMIUM_DAYS} дней`,
      payload: INVOICE_PAYLOAD,
      provider_token: "",
      currency: "XTR",
      prices: [{ label: "Premium", amount: PREMIUM_STARS }]
    })
  });

  const data = await response.json() as { ok: boolean; result?: string };
  if (!data.ok) { res.status(500).json({ error: "Failed to create invoice" }); return; }
  res.json({ url: data.result });
});

// GET /api/tribute/status — текущий статус подписки пользователя
tributeRouter.get("/status", async (req, res) => {
  const telegramId = Number(req.query.telegram_id);
  if (!telegramId) {
    res.status(400).json({ error: "telegram_id required" });
    return;
  }

  const [user] = await sql`
    SELECT subscription_tier, subscription_expires_at FROM users WHERE telegram_id = ${telegramId}
  `;

  if (!user) {
    res.status(404).json({ error: "user not found" });
    return;
  }

  const isPremium =
    user.subscription_tier === "premium" &&
    (!user.subscription_expires_at || new Date(user.subscription_expires_at) > new Date());

  res.json({
    tier: isPremium ? "premium" : "free",
    expires_at: user.subscription_expires_at ?? null
  });
});
