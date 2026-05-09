import { Request, Response } from "express";
import { handleHabitsSummary, handleNewHabit } from "./handlers/habits";
import { handleInline } from "./handlers/inline";
import { handleStats } from "./handlers/logging";
import { handleStart } from "./handlers/start";
import {
  answerInlineQuery,
  answerPreCheckoutQuery,
  miniAppButton,
  sendInvoice,
  sendTelegramMessage
} from "../utils/telegram";
import { sql } from "../database/db";

const PREMIUM_STARS = 250; // ~$5/месяц
const PREMIUM_DAYS = 30;
const INVOICE_PAYLOAD = "habitflow_premium_monthly";

export async function handleTelegramWebhook(req: Request, res: Response): Promise<void> {
  const update = req.body;

  try {
    // Пользователь подтверждает оплату — отвечаем немедленно
    if (update?.pre_checkout_query) {
      const query = update.pre_checkout_query;
      const ok = query.invoice_payload === INVOICE_PAYLOAD;
      await answerPreCheckoutQuery(query.id, ok, ok ? undefined : "Неверный платёж");
      res.status(200).json({ ok: true, type: "pre_checkout" });
      return;
    }

    // Успешная оплата Stars
    if (update?.message?.successful_payment) {
      const payment = update.message.successful_payment;
      const telegramId = update.message.from?.id as number;

      if (payment.invoice_payload === INVOICE_PAYLOAD && telegramId) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + PREMIUM_DAYS);

        await sql`
          UPDATE users
          SET subscription_tier = 'premium',
              subscription_expires_at = ${expiresAt.toISOString()},
              updated_at = CURRENT_TIMESTAMP
          WHERE telegram_id = ${telegramId}
        `;

        await sendTelegramMessage(
          telegramId,
          `🎉 Premium активирован на ${PREMIUM_DAYS} дней!\n\nТеперь ты можешь добавлять неограниченное количество привычек. Спасибо за поддержку HabitFlow! ⭐`
        );
      }

      res.status(200).json({ ok: true, type: "payment" });
      return;
    }

    const text = update?.message?.text as string | undefined;
    const chatId = update?.message?.chat?.id as number | undefined;
    const firstName = update?.message?.from?.first_name as string | undefined;
    const inlineQuery = update?.inline_query?.query as string | undefined;
    const inlineQueryId = update?.inline_query?.id as string | undefined;

    if (inlineQuery && inlineQueryId) {
      const inlineText = handleInline(inlineQuery);
      await answerInlineQuery(inlineQueryId, inlineText);
      res.status(200).json({ ok: true, type: "inline" });
      return;
    }

    if (!text || !chatId) {
      res.status(200).json({ ok: true, message: "unsupported update type" });
      return;
    }

    let message = "Команда не распознана. Доступно: /start /habits /newhabit /stats /app /premium";
    let withButton = false;

    if (text.startsWith("/start")) {
      message = handleStart(firstName);
      withButton = true;
    } else if (text.startsWith("/habits")) {
      message = handleHabitsSummary();
    } else if (text.startsWith("/newhabit")) {
      message = handleNewHabit();
    } else if (text.startsWith("/stats")) {
      message = handleStats();
    } else if (text.startsWith("/premium")) {
      // Отправляем счёт на оплату Stars
      await sendInvoice(
        chatId,
        "HabitFlow Premium",
        `Неограниченные привычки на ${PREMIUM_DAYS} дней. Отменить можно в любой момент.`,
        INVOICE_PAYLOAD,
        PREMIUM_STARS
      );
      res.status(200).json({ ok: true, type: "invoice_sent" });
      return;
    } else if (text.startsWith("/appss_verify")) {
      message = "appss_b2ab7d";
    } else if (text.startsWith("/app")) {
      message = "Нажми кнопку ниже, чтобы открыть HabitFlow";
      withButton = true;
    }

    await sendTelegramMessage(chatId, message, withButton ? miniAppButton() : undefined);
    console.log("Telegram command:", text, "=>", message);
    res.status(200).json({ ok: true, delivered: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(200).json({ ok: false, error: "telegram_delivery_failed" });
  }
}
