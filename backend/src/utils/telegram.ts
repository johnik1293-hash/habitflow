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

export async function sendTelegramMessage(chatId: number, text: string): Promise<void> {
  await callTelegram("sendMessage", { chat_id: chatId, text });
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

