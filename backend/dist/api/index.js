import { Router } from "express";
import { analyticsRouter } from "./routes/analytics.js";
import { habitsRouter } from "./routes/habits.js";
import { loggingRouter } from "./routes/logging.js";
import { userRouter } from "./routes/user.js";
export const apiRouter = Router();
apiRouter.get("/health", (_req, res) => {
    res.json({ ok: true, service: "habitflow-backend" });
});
apiRouter.use("/habits", habitsRouter);
apiRouter.use("/habits", loggingRouter);
apiRouter.use("/analytics", analyticsRouter);
apiRouter.use("/user", userRouter);
