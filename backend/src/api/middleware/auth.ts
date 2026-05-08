import { NextFunction, Request, Response } from "express";

export function authByTelegramHeader(req: Request, res: Response, next: NextFunction): void {
  const telegramId = req.header("x-telegram-id");
  if (!telegramId) {
    res.status(401).json({ error: "x-telegram-id header is required" });
    return;
  }
  next();
}

