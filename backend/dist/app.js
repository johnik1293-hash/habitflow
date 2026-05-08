import "dotenv/config";
import cors from "cors";
import express from "express";
import { apiRouter } from "./api/index.js";
import { handleTelegramWebhook } from "./bot/index.js";
import { runMigrations } from "./database/db.js";
import { startNotificationWorker } from "./services/notificationService.js";
const app = express();
const port = Number(process.env.PORT ?? 3000);
runMigrations();
startNotificationWorker();
app.use(cors());
app.use(express.json());
app.get("/", (_req, res) => {
    res.json({ name: "HabitFlow API", status: "running" });
});
app.use("/api", apiRouter);
app.post("/webhook", handleTelegramWebhook);
app.listen(port, () => {
    console.log(`HabitFlow backend listening on :${port}`);
});
