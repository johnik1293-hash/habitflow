import "dotenv/config";

async function main() {
  const token = process.env.BOT_TOKEN;
  const webhookUrl = process.env.WEBHOOK_URL;

  if (!token || !webhookUrl) {
    throw new Error("BOT_TOKEN and WEBHOOK_URL must be configured");
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: webhookUrl })
  });

  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(`setWebhook failed: ${JSON.stringify(data)}`);
  }

  console.log("Webhook configured:", webhookUrl);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

