import { Router } from "express";
import { analyticsRouter } from "./routes/analytics";
import { habitsRouter } from "./routes/habits";
import { loggingRouter } from "./routes/logging";
import { userRouter } from "./routes/user";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ ok: true, service: "habitflow-backend" });
});

apiRouter.use("/habits", habitsRouter);
apiRouter.use("/habits", loggingRouter);
apiRouter.use("/analytics", analyticsRouter);
apiRouter.use("/user", userRouter);
