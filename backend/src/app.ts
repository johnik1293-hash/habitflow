import "dotenv/config";
import cors from "cors";
import express from "express";
import { apiRouter } from "./api/index.js";
import { handleTelegramWebhook } from "./bot/index.js";
import { processDueNotifications } from "./services/notificationService.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ name: "HabitFlow API", status: "running" });
});

app.use("/api", apiRouter);
app.post("/webhook", handleTelegramWebhook);

// Vercel Cron endpoint — POST /api/cron/notifications
app.post("/api/cron/notifications", async (_req, res) => {
  await processDueNotifications();
  res.json({ ok: true });
});

if (process.env.VERCEL !== "1") {
  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => {
    console.log(`HabitFlow backend listening on :${port}`);
  });
}

export default app;
