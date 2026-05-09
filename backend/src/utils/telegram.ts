const telegramApiBase = "https://api.telegram.org";

function getBotToken(): string {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    throw new Error("BOT_TOKEN is not configured");
  }
  return token;
}

async function callTelegram(method: string, payload: unknown): Promise<void> {
  const token = getBotToken();
  const url = `${telegramApiBase}/bot${token}/${method}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram API ${method} failed: ${response.status} ${body}`);
  }
}

export async function sendTelegramMessage(
  chatId: number,
  text: string,
  replyMarkup?: unknown
): Promise<void> {
  const payload: Record<string, unknown> = { chat_id: chatId, text };
  if (replyMarkup) payload.reply_markup = replyMarkup;
  await callTelegram("sendMessage", payload);
}

export function miniAppButton(label = "🚀 Открыть HabitFlow") {
  const url = process.env.MINI_APP_URL;
  if (!url) return undefined;
  return {
    inline_keyboard: [[{ text: label, web_app: { url } }]]
  };
}

export async function sendInvoice(
  chatId: number,
  title: string,
  description: string,
  payload: string,
  starCount: number
): Promise<void> {
  await callTelegram("sendInvoice", {
    chat_id: chatId,
    title,
    description,
    payload,
    provider_token: "",   // пустой = оплата Stars
    currency: "XTR",
    prices: [{ label: title, amount: starCount }]
  });
}

export async function answerPreCheckoutQuery(queryId: string, ok: boolean, errorMessage?: string): Promise<void> {
  const body: Record<string, unknown> = { pre_checkout_query_id: queryId, ok };
  if (!ok && errorMessage) body.error_message = errorMessage;
  await callTelegram("answerPreCheckoutQuery", body);
}

export async function answerInlineQuery(inlineQueryId: string, text: string): Promise<void> {
  await callTelegram("answerInlineQuery", {
    inline_query_id: inlineQueryId,
    cache_time: 0,
    results: [
      {
        type: "article",
        id: "habitflow-inline-1",
        title: "HabitFlow",
        description: text,
        input_message_content: { message_text: text }
      }
    ]
  });
}

