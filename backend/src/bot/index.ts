import { Request, Response } from "express";
import { handleHabitsSummary, handleNewHabit } from "./handlers/habits";
import { handleInline } from "./handlers/inline";
import { handleStats } from "./handlers/logging";
import { handleStart } from "./handlers/start";
import { answerInlineQuery, sendTelegramMessage } from "../utils/telegram";

export async function handleTelegramWebhook(req: Request, res: Response): Promise<void> {
  const update = req.body;
  const text = update?.message?.text as string | undefined;
  const chatId = update?.message?.chat?.id as number | undefined;
  const firstName = update?.message?.from?.first_name as string | undefined;
  const inlineQuery = update?.inline_query?.query as string | undefined;
  const inlineQueryId = update?.inline_query?.id as string | undefined;

  try {
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

    let message = "Команда не распознана. Доступно: /start /habits /newhabit /stats /app";
    if (text.startsWith("/start")) message = handleStart(firstName);
    if (text.startsWith("/habits")) message = handleHabitsSummary();
    if (text.startsWith("/newhabit")) message = handleNewHabit();
    if (text.startsWith("/stats")) message = handleStats();
    if (text.startsWith("/appss_verify")) message = "appss_b2ab7d";
    else if (text.startsWith("/app")) message = `Открыть Mini App: ${process.env.MINI_APP_URL ?? "not configured"}`;

    await sendTelegramMessage(chatId, message);
    console.log("Telegram command:", text, "=>", message);
    res.status(200).json({ ok: true, delivered: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(200).json({ ok: false, error: "telegram_delivery_failed" });
  }
}
