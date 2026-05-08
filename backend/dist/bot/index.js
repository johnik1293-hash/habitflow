import { handleHabitsSummary, handleNewHabit } from "./handlers/habits.js";
import { handleInline } from "./handlers/inline.js";
import { handleStats } from "./handlers/logging.js";
import { handleStart } from "./handlers/start.js";
import { answerInlineQuery, sendTelegramMessage } from "../utils/telegram.js";
export async function handleTelegramWebhook(req, res) {
    const update = req.body;
    const text = update?.message?.text;
    const chatId = update?.message?.chat?.id;
    const firstName = update?.message?.from?.first_name;
    const inlineQuery = update?.inline_query?.query;
    const inlineQueryId = update?.inline_query?.id;
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
        if (text.startsWith("/start"))
            message = handleStart(firstName);
        if (text.startsWith("/habits"))
            message = handleHabitsSummary();
        if (text.startsWith("/newhabit"))
            message = handleNewHabit();
        if (text.startsWith("/stats"))
            message = handleStats();
        if (text.startsWith("/app"))
            message = `Открыть Mini App: ${process.env.MINI_APP_URL ?? "not configured"}`;
        await sendTelegramMessage(chatId, message);
        console.log("Telegram command:", text, "=>", message);
        res.status(200).json({ ok: true, delivered: true });
    }
    catch (error) {
        console.error("Webhook processing error:", error);
        res.status(200).json({ ok: false, error: "telegram_delivery_failed" });
    }
}
